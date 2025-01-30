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
        <h1 className="text-3xl font-bold tracking-tight">Fridge Inventory</h1>
        <Link href="/add-product">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductList products={mockProducts} />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Recipe Suggestions</h2>
          <Link href="/recipes">
            <Button variant="outline" size="sm">
              <ChefHat className="mr-2 h-4 w-4" />
              View All Recipes
            </Button>
          </Link>
        </div>
        
        <p className="text-gray-600 mb-4">
          Our AI-powered system suggests meals based on your available ingredients.
          {suggestedRecipes.length > 0 ? (
            <span className="font-medium"> You currently have {suggestedRecipes.length} suggested recipes!</span>
          ) : (
            <span className="font-medium"> Add more ingredients to get recipe suggestions.</span>
          )}
        </p>
      </div>
    </div>
  )
}
