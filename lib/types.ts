export interface Product {
  id: string
  name: string
  quantity: number
  unit: string
  dateAdded: string
  expirationDate: string
}

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
  available: boolean
}

export interface Recipe {
  id: string
  name: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  missingIngredients?: string[]
}
