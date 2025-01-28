import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductList from "@/components/ProductList"
import { mockProducts } from "@/lib/data"
import { PlusCircle, ChefHat } from "lucide-react"
import { getSuggestedRecipes } from "./actions"

export default async function Home() {
  const suggestedRecipes = await getSuggestedRecipes()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Fridge Inventory</h1>
        <Link href="/add-product">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      <ProductList products={mockProducts} />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Suggested Recipes</h2>
        <p className="text-gray-600 mb-4">
          Discover delicious recipes based on your fridge inventory. Our AI-powered system suggests meals tailored to
          your available ingredients.
        </p>
        <p className="text-gray-600 mb-4">
          You have <strong>{suggestedRecipes.length}</strong> suggested recipes based on your current inventory.
        </p>
        <Link href="/recipes">
          <Button variant="outline" className="w-full sm:w-auto">
            <ChefHat className="mr-2 h-4 w-4" />
            View Recipes
          </Button>
        </Link>
      </div>
    </div>
  )
}

