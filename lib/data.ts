import type { Product, Recipe, RecipeIngredient } from "./types"

// Helper to generate dates relative to today
function getDate(daysFromNow: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

// Helper to parse ingredient strings into structured data
export function parseIngredient(ingredientStr: string): RecipeIngredient {
  const match = ingredientStr.match(/^([\d.]+)\s+(\w+)\s+(.+)$/)
  if (match) {
    const [_, quantity, unit, name] = match
    return {
      name: name.toLowerCase(),
      quantity: parseFloat(quantity),
      unit: unit.toLowerCase(),
      available: false
    }
  }
  return {
    name: ingredientStr.toLowerCase(),
    quantity: 1,
    unit: 'piece',
    available: false
  }
}

// Helper to check ingredient availability
export function checkIngredientAvailability(ingredient: RecipeIngredient, products: Product[]): boolean {
  const matchingProduct = products.find(p => 
    p.name.toLowerCase() === ingredient.name.toLowerCase() && 
    p.unit.toLowerCase() === ingredient.unit.toLowerCase() &&
    p.quantity >= ingredient.quantity
  )
  return !!matchingProduct
}

// Helper to process recipe ingredients
export function processRecipeIngredients(recipe: Recipe, products: Product[]): Recipe {
  const ingredients = recipe.ingredients.map(ingredient => {
    const parsedIngredient = typeof ingredient === 'string' ? parseIngredient(ingredient) : ingredient
    return {
      ...parsedIngredient,
      available: checkIngredientAvailability(parsedIngredient, products)
    }
  })

  const missingIngredients = ingredients
    .filter(ingredient => !ingredient.available)
    .map(ingredient => ingredient.name)

  return {
    ...recipe,
    ingredients,
    missingIngredients
  }
}

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Milk",
    quantity: 1,
    unit: "gallon",
    dateAdded: getDate(0),
    expirationDate: getDate(7),
  },
  {
    id: "2",
    name: "Eggs",
    quantity: 12,
    unit: "pieces",
    dateAdded: getDate(0),
    expirationDate: getDate(14),
  },
  {
    id: "3",
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    dateAdded: getDate(0),
    expirationDate: getDate(21),
  },
  {
    id: "4",
    name: "Butter",
    quantity: 500,
    unit: "grams",
    dateAdded: getDate(0),
    expirationDate: getDate(30),
  },
  {
    id: "5",
    name: "Chicken Breast",
    quantity: 2,
    unit: "pounds",
    dateAdded: getDate(0),
    expirationDate: getDate(5),
  }
]

// Mock recipes for when OpenAI API is unavailable
const baseRecipes: Recipe[] = [
  {
    id: "mock-1",
    name: "Classic Scrambled Eggs",
    ingredients: [
      { name: "eggs", quantity: 3, unit: "pieces", available: false },
      { name: "milk", quantity: 0.25, unit: "gallon", available: false },
      { name: "butter", quantity: 50, unit: "grams", available: false }
    ],
    instructions: [
      "Crack eggs into a bowl and add milk, salt, and pepper",
      "Whisk until well combined",
      "Melt butter in a non-stick pan over medium heat",
      "Pour in egg mixture and stir gently until eggs are set but still creamy",
      "Serve immediately"
    ]
  },
  {
    id: "mock-2",
    name: "Creamy Mac and Cheese",
    ingredients: [
      { name: "milk", quantity: 0.25, unit: "gallon", available: false },
      { name: "cheese", quantity: 150, unit: "grams", available: false },
      { name: "butter", quantity: 50, unit: "grams", available: false }
    ],
    instructions: [
      "Cook macaroni according to package instructions",
      "In a saucepan, melt butter over medium heat",
      "Add milk and bring to a gentle simmer",
      "Gradually stir in grated cheese until melted and smooth",
      "Combine with cooked macaroni and serve"
    ]
  },
  {
    id: "mock-3",
    name: "Pan-Seared Chicken Breast",
    ingredients: [
      { name: "chicken breast", quantity: 1, unit: "pounds", available: false },
      { name: "butter", quantity: 50, unit: "grams", available: false }
    ],
    instructions: [
      "Season chicken breasts with salt and pepper",
      "Heat butter in a large skillet over medium-high heat",
      "Cook chicken for 5-7 minutes per side until golden brown",
      "Let rest for 5 minutes before serving",
      "Serve with your favorite sides"
    ]
  }
]

// Process mock recipes with availability information
export const mockRecipes = baseRecipes.map(recipe => processRecipeIngredients(recipe, defaultProducts))

// Client-side storage functions
export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return defaultProducts
  
  const stored = localStorage.getItem('fridge-products')
  if (!stored) {
    localStorage.setItem('fridge-products', JSON.stringify(defaultProducts))
    return defaultProducts
  }
  
  return JSON.parse(stored)
}

export function addStoredProduct(product: Product) {
  const products = getStoredProducts()
  products.push(product)
  localStorage.setItem('fridge-products', JSON.stringify(products))
}

export function removeStoredProduct(productId: string) {
  const products = getStoredProducts()
  const filtered = products.filter(p => p.id !== productId)
  localStorage.setItem('fridge-products', JSON.stringify(filtered))
}

// For server-side rendering initial state
export const mockProducts = defaultProducts
