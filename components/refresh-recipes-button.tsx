"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { refreshRecipes } from "@/app/actions"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function RefreshRecipesButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const result = await refreshRecipes()
      if (result.success) {
        toast({
          title: "Success",
          description: "Recipes have been refreshed!",
        })
        // Refresh the page to show new recipes
        window.location.reload()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh recipes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={isLoading}
      variant="outline"
      className="bg-white hover:bg-gray-100"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Refreshing..." : "Refresh Recipes"}
    </Button>
  )
}
