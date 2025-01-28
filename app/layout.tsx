import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Smart Fridge",
  description: "Keep track of your fridge inventory and get recipe suggestions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <Navbar />
        <main className="container mx-auto p-4 pt-20">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}

