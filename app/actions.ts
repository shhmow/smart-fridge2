"use server"

import { revalidatePath } from "next/cache"
import { mockProducts, mockRecipes, processRecipeIngredients, getStoredProducts } from "@/lib/data"
import type { Product, Recipe, RecipeIngredient } from "@/lib/types"
import OpenAI from "openai"
import { headers } from 'next/headers'

// Keep track of the last request time
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 500 // minimum time between requests in ms

export async function addProduct(formData: FormData): Promise<{ success: boolean; message: string; product: Product | null }> {
  try {
    const name = formData.get("name") as string
    const quantity = Number.parseInt(formData.get("quantity") as string, 10)
    const unit = formData.get("unit") as string
    const expirationDate = formData.get("expirationDate") as string

    if (!name || !quantity || !unit || !expirationDate) {
      return { success: false, message: "All fields are required", product: null }
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      quantity,
      unit,
      dateAdded: new Date().toISOString().split("T")[0],
      expirationDate,
    }

    revalidatePath("/")
    return { success: true, message: "Product added successfully", product: newProduct }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, message: "Failed to add product", product: null }
  }
}

export async function removeProduct(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    revalidatePath("/")
    return { success: true, message: "Product removed successfully" }
  } catch (error) {
    console.error("Error removing product:", error)
    return { success: false, message: "Failed to remove product" }
  }
}

export async function getSuggestedRecipes(forceRefresh = false): Promise<Recipe[]> {
  console.log("Starting getSuggestedRecipes with forceRefresh:", forceRefresh)
  console.log("API Key exists:", !!process.env.OPENAI_API_KEY)
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is missing")
    throw new Error("OpenAI API key is not configured")
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const products = mockProducts
    console.log("Using products:", products)

    console.log("Sending request to OpenAI...")
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful cooking assistant that suggests recipes based on available ingredients."
        },
        {
          role: "user",
          content: `Here is my current fridge inventory:
          ${products.map(p => `- ${p.quantity} ${p.unit} of ${p.name}`).join('\n          ')}
          
          Suggest 3 practical recipes that can be made using ONLY these ingredients.
          Each recipe must:
          1. ONLY use ingredients from the provided inventory
          2. Specify exact quantities that match the units in the inventory
          3. Be practical and doable with basic kitchen equipment
          
          Format your response as a JSON object with a "recipes" array. Each recipe must have:
          - name: string (descriptive name)
          - ingredients: array of objects with:
            - name: string (must match inventory exactly)
            - quantity: number (must not exceed inventory)
            - unit: string (must match inventory exactly)
          - instructions: string[] (step-by-step instructions)`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    console.log("Received OpenAI response:", response.choices[0].message)
    
    const content = response.choices[0].message.content
    if (!content) {
      console.error("No content in OpenAI response")
      throw new Error("Failed to generate recipes: Empty response")
    }

    console.log("Parsing response content:", content)
    const parsedResponse = JSON.parse(content)
    
    if (!parsedResponse.recipes || !Array.isArray(parsedResponse.recipes)) {
      console.error("Invalid response format:", parsedResponse)
      throw new Error("Failed to generate recipes: Invalid format")
    }

    const recipes = parsedResponse.recipes.map((recipe: Recipe, index: number) => ({
      ...recipe,
      id: `generated-${index + 1}-${Date.now()}`,
    }))

    console.log("Generated recipes:", recipes)
    return recipes.map(recipe => processRecipeIngredients(recipe, products))
    
  } catch (error) {
    console.error("Error in getSuggestedRecipes:", error)
    throw error
  }
}

export async function refreshRecipes(): Promise<{ success: boolean; message: string }> {
  console.log("Starting refreshRecipes")
  try {
    // Force a new recipe generation
    await getSuggestedRecipes(true)
    
    // Force revalidation of all pages that show recipes
    revalidatePath("/recipes")
    revalidatePath("/")
    
    console.log("Recipes refreshed successfully")
    return { success: true, message: "Recipes refreshed successfully" }
  } catch (error) {
    console.error("Error in refreshRecipes:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to refresh recipes" 
    }
  }
}

// Rate limiting check
export async function getSuggestedRecipesOld(forceRefresh = false): Promise<Recipe[]> {
  const now = Date.now()
  if (!forceRefresh && now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    console.log("Request too soon, using cached recipes")
    return mockRecipes
  }
  lastRequestTime = now

  if (!process.env.OPENAI_API_KEY) {
    console.log("OpenAI API key not found, using mock recipes")
    return mockRecipes
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const products = mockProducts
    console.log("Current inventory:", products)

    // Add randomization to the prompt to ensure variety
    const randomPrompts = [
      "Create unique recipes that showcase these ingredients in creative ways.",
      "Design simple but delicious recipes using these ingredients.",
      "Suggest healthy and nutritious recipes from these ingredients.",
      "Create quick and easy recipes perfect for busy weekdays."
    ]
    const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)]

    console.log("Sending request to OpenAI...")
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { 
          role: "system", 
          content: `You are a helpful cooking assistant that suggests recipes based on available ingredients. 
          You must ONLY suggest recipes that can be made with the EXACT ingredients provided, using the EXACT units specified.
          Do not assume the user has any additional ingredients like salt, pepper, or spices.
          Do not suggest recipes that require ANY ingredients not explicitly listed in the inventory.
          ${randomPrompt}`
        },
        {
          role: "user",
          content: `Here is my current fridge inventory:
          ${products.map(p => `- ${p.quantity} ${p.unit} of ${p.name}`).join('\n          ')}
          
          Suggest 3 practical recipes that can be made using ONLY these ingredients.
          Each recipe must:
          1. ONLY use ingredients from the provided inventory - do not assume any other ingredients are available
          2. Specify exact quantities that match the units in the inventory
          3. Be practical and doable with basic kitchen equipment
          
          Format your response as a JSON object with a "recipes" array. Each recipe must have:
          - name: string (descriptive name)
          - ingredients: array of objects with:
            - name: string (must match inventory exactly)
            - quantity: number (must not exceed inventory)
            - unit: string (must match inventory exactly)
          - instructions: string[] (step-by-step instructions)
          
          Example format:
          {
            "recipes": [
              {
                "name": "Simple Scrambled Eggs",
                "ingredients": [
                  { "name": "eggs", "quantity": 3, "unit": "pieces" },
                  { "name": "milk", "quantity": 0.1, "unit": "gallon" }
                ],
                "instructions": ["Step 1...", "Step 2..."]
              }
            ]
          }
          
          Remember: ONLY use ingredients that are explicitly listed in the inventory with matching units.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.9, // Increased for more variety
    })

    console.log("Received response from OpenAI")
    const content = response.choices[0].message.content
    if (!content) {
      console.error("No content in OpenAI response")
      return mockRecipes
    }

    console.log("Parsing OpenAI response...")
    const parsedResponse = JSON.parse(content)
    if (!parsedResponse.recipes || !Array.isArray(parsedResponse.recipes)) {
      console.error("Invalid response format from OpenAI:", parsedResponse)
      return mockRecipes
    }

    // Process recipes to check ingredient availability
    const recipes = parsedResponse.recipes.map((recipe: Recipe, index: number) => ({
      ...recipe,
      id: `generated-${index + 1}-${now}`,
    })).map(recipe => processRecipeIngredients(recipe, products))

    console.log("Generated recipes:", recipes)
    return recipes
  } catch (error) {
    console.error("Error generating recipes:", error)
    return mockRecipes
  }
}
