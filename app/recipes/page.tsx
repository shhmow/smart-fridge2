import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSuggestedRecipes } from "@/app/actions"
import { Utensils } from "lucide-react"

export default async function Recipes() {
  const recipes = await getSuggestedRecipes()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Suggested Recipes</h1>
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="flex items-center">
                  <Utensils className="mr-2 h-5 w-5" />
                  {recipe.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2 text-gray-700">Ingredients:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <p className="text-lg text-yellow-800">
              <strong>No recipes available.</strong> Add more items to your inventory to see suggested recipes.
            </p>
          </CardContent>
        </Card>
      )}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <p className="text-lg text-blue-800">
            <strong>Note:</strong> This is a mock recipes section. In a real application, this would be integrated with
            an LLM to provide personalized recipe suggestions based on your fridge inventory.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

