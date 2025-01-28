import Link from "next/link"
import { Refrigerator } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Refrigerator className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-gray-800">Smart Fridge</span>
          </Link>
          <div className="flex space-x-4">
            <Link href="/" className="text-gray-600 hover:text-blue-500">
              Home
            </Link>
            <Link href="/add-product" className="text-gray-600 hover:text-blue-500">
              Add Product
            </Link>
            <Link href="/recipes" className="text-gray-600 hover:text-blue-500">
              Recipes
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

