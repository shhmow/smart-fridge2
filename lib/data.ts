import type { Product, Recipe } from "./types"

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Milk",
    quantity: 1,
    unit: "gallon",
    dateAdded: "2023-05-01",
    expirationDate: "2023-05-10",
  },
  {
    id: "2",
    name: "Eggs",
    quantity: 12,
    unit: "pieces",
    dateAdded: "2023-05-02",
    expirationDate: "2023-05-16",
  },
  {
    id: "3",
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    dateAdded: "2023-05-03",
    expirationDate: "2023-05-20",
  },
]

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Scrambled Eggs",
    ingredients: ["Eggs", "Milk", "Salt", "Pepper"],
  },
  {
    id: "2",
    name: "Grilled Cheese Sandwich",
    ingredients: ["Bread", "Cheese", "Butter"],
  },
]

