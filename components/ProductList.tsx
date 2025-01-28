"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { removeProduct } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products: initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts)
  const { toast } = useToast()

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
      setProducts(products.filter((product) => product.id !== productId))
      toast({
        title: "Product removed",
        description: result.message,
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const { status, color } = getExpirationStatus(product.expirationDate)
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{`${product.quantity} ${product.unit}`}</TableCell>
                  <TableCell>{new Date(product.dateAdded).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(product.expirationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={color}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

