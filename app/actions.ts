"use server"

import { revalidatePath } from "next/cache"
import { mockProducts } from "@/lib/data"
import type { Product, Recipe } from "@/lib/types"
import OpenAI from "openai"

export async function addProduct(formData: FormData): Promise<{ success: boolean; message: string }> {
  const name = formData.get("name") as string
  const quantity = Number.parseInt(formData.get("quantity") as string, 10)
  const unit = formData.get("unit") as string
  const expirationDate = formData.get("expirationDate") as string

  if (!name || !quantity || !unit || !expirationDate) {
    return { success: false, message: "All fields are required" }
  }

  const newProduct: Product = {
    id: (mockProducts.length + 1).toString(),
    name,
    quantity,
    unit,
    dateAdded: new Date().toISOString().split("T")[0],
    expirationDate,
  }

  mockProducts.push(newProduct)
  revalidatePath("/")

  return { success: true, message: "Product added successfully" }
}

export async function removeProduct(productId: string): Promise<{ success: boolean; message: string }> {
  const index = mockProducts.findIndex((product) => product.id === productId)
  if (index !== -1) {
    mockProducts.splice(index, 1)
    revalidatePath("/")
    return { success: true, message: "Product removed successfully" }
  }
  return { success: false, message: "Product not found" }
}

export async function getSuggestedRecipes(): Promise<Recipe[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const inventoryItems = mockProducts.map((product) => 
    `${product.quantity} ${product.unit} of ${product.name.toLowerCase()}`
  ).join(", ")

  const prompt = `As a culinary expert, suggest 3 practical recipes using ONLY the following ingredients from my fridge inventory: ${inventoryItems}

  Requirements:
  1. ONLY use ingredients from the provided inventory
  2. Consider the available quantities
  3. Recipes should be practical and doable with basic kitchen equipment
  4. If there aren't enough ingredients for a complete meal, suggest a partial recipe or simple dish

  Format each recipe as a JSON object with:
  - name: A descriptive name
  - ingredients: List of ingredients with quantities (only from inventory)
  - instructions: Step-by-step cooking instructions
  
  Return an array of 3 recipe objects.`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, 
      temperature: 0.7,
    })

    const recipesString = response.choices[0].message.content
    if (!recipesString) {
      throw new Error("Failed to generate recipes")
    }

    const parsedResponse = JSON.parse(recipesString)
    const recipes: Recipe[] = parsedResponse.recipes || []
    return recipes.map((recipe, index) => ({
      ...recipe,
      id: `generated-${index + 1}`,
    }))
  } catch (error) {
    console.error("Error generating recipes:", error)
    return []
  }
}

export async function refreshRecipes(): Promise<{ success: boolean; message: string }> {
  try {
    await getSuggestedRecipes()
    revalidatePath("/recipes")
    return { success: true, message: "Recipes refreshed successfully" }
  } catch (error) {
    console.error("Error refreshing recipes:", error)
    return { success: false, message: "Failed to refresh recipes" }
  }
}
