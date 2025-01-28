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

  const ingredients = mockProducts.map((product) => product.name).join(", ")

  const prompt = `Given the following ingredients: ${ingredients}
  Suggest 3 recipes that can be made. For each recipe, provide:
  1. A name
  2. A list of ingredients (only use the provided ingredients)
  3. Brief instructions

  Format the output as a JSON array of objects, each with 'name', 'ingredients', and 'instructions' properties.`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    })

    const recipesString = response.choices[0].message.content
    if (!recipesString) {
      throw new Error("Failed to generate recipes")
    }

    const recipes: Recipe[] = JSON.parse(recipesString)
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

