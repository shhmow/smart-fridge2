export interface Product {
  id: string
  name: string
  quantity: number
  unit: string
  dateAdded: string
  expirationDate: string
}

export interface Recipe {
  id: string
  name: string
  ingredients: string[]
}

