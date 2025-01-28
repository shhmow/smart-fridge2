import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSuggestedRecipes } from "@/app/actions"
import { ChefHat, ListOrdered, ScrollText } from "lucide-react"
import { RefreshRecipesButton } from "@/components/refresh-recipes-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default async function Recipes() {
  const recipes = await getSuggestedRecipes()

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Suggested Recipes</h1>
        <RefreshRecipesButton />
      </div>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="flex items-center text-xl">
                  <ChefHat className="mr-2 h-5 w-5" />
                  {recipe.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="ingredients">
                    <AccordionTrigger className="text-lg font-semibold text-gray-700">
                      <div className="flex items-center">
                        <ListOrdered className="mr-2 h-5 w-5" />
                        Ingredients
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 pt-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="ml-2">{ingredient}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="instructions">
                    <AccordionTrigger className="text-lg font-semibold text-gray-700">
                      <div className="flex items-center">
                        <ScrollText className="mr-2 h-5 w-5" />
                        Instructions
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-gray-600 space-y-2 pt-2">
                        {typeof recipe.instructions === 'string' ? (
                          <p>{recipe.instructions}</p>
                        ) : (
                          <ol className="list-decimal list-inside space-y-1">
                            {Array.isArray(recipe.instructions) ? 
                              recipe.instructions.map((step, index) => (
                                <li key={index} className="ml-2">{step}</li>
                              ))
                              : null
                            }
                          </ol>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
    </div>
  )
}
