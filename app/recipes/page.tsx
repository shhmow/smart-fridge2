import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSuggestedRecipes } from "@/app/actions"
import { ChefHat, ListOrdered, ScrollText, Check, X } from "lucide-react"
import { RefreshRecipesButton } from "@/components/refresh-recipes-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { headers } from 'next/headers'

// Make page dynamic to ensure fresh data on each request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Recipes() {
  let recipes = []
  let error = null

  try {
    // Get the request timestamp to force a fresh request
    const requestTime = headers().get('x-request-time') || Date.now().toString()
    recipes = await getSuggestedRecipes(true)
  } catch (e) {
    console.error("Error in recipes page:", e)
    error = e instanceof Error ? e.message : "Failed to generate recipes"
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Suggested Recipes</h1>
        <RefreshRecipesButton />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === "OpenAI API key is not configured" 
              ? "The OpenAI API key is not configured. Please check your environment variables."
              : error}
          </AlertDescription>
        </Alert>
      )}

      {!error && recipes.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              No recipes available. Try adding more ingredients to your inventory or click refresh to generate new recipes.
            </p>
          </CardContent>
        </Card>
      )}

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <ChefHat className="mr-2 h-5 w-5" />
                    {recipe.name}
                  </CardTitle>
                  {recipe.missingIngredients?.length === 0 ? (
                    <Badge className="bg-green-500">Ready to Cook</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      Missing {recipe.missingIngredients?.length} ingredients
                    </Badge>
                  )}
                </div>
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
                      <ul className="space-y-2 pt-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span className="flex items-center">
                              {ingredient.available ? (
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <X className="mr-2 h-4 w-4 text-red-500" />
                              )}
                              <span className={ingredient.available ? "text-gray-700" : "text-gray-400"}>
                                {ingredient.quantity} {ingredient.unit} {ingredient.name}
                              </span>
                            </span>
                            {!ingredient.available && (
                              <Badge variant="outline" className="text-red-500 border-red-200">
                                Missing
                              </Badge>
                            )}
                          </li>
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
                      <ol className="list-decimal list-inside text-gray-600 space-y-2 pt-2">
                        {recipe.instructions.map((instruction, index) => (
                          <li key={index} className="ml-2">{instruction}</li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
