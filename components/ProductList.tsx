"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { removeProduct } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"
import { getStoredProducts, removeStoredProduct } from "@/lib/data"

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products: initialProducts }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const { toast } = useToast()

  // Load products from localStorage on mount
  useEffect(() => {
    const storedProducts = getStoredProducts()
    setProducts(storedProducts)
  }, [])

  const getExpirationStatus = (expirationDate: string) => {
    const daysUntilExpiration = Math.ceil(
      (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24),
    )
    if (daysUntilExpiration < 0) return { status: "expired", color: "bg-red-100 text-red-800" }
    if (daysUntilExpiration <= 3) return { status: "expiring soon", color: "bg-yellow-100 text-yellow-800" }
    return { status: "fresh", color: "bg-green-100 text-green-800" }
  }

  const handleRemove = async (productId: string) => {
    const result = await removeProduct(productId)
    if (result.success) {
      // Remove from localStorage
      removeStoredProduct(productId)
      // Update state
      setProducts(products.filter((product) => product.id !== productId))
      toast({
        title: "Success",
        description: "Product removed successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No products in inventory</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const { status, color } = getExpirationStatus(product.expirationDate)
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.quantity} {product.unit}
                    </TableCell>
                    <TableCell>{product.dateAdded}</TableCell>
                    <TableCell>{product.expirationDate}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={color}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemove(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
