"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { refreshRecipes } from "@/app/actions"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function RefreshRecipesButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const result = await refreshRecipes()
      if (result.success) {
        toast({
          title: "Success",
          description: "New recipes have been generated!",
        })
        // Force a hard refresh of the page
        router.refresh()
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
      // Add a slight delay before enabling the button again to prevent spam
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
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
      {isLoading ? "Generating..." : "New Recipes"}
    </Button>
  )
}
