"use client"

import Link from "next/link"
import { motion } from "framer-motion"

type Category = {
  id: string
  name: string
  slug: string
  color: string
}

type CategoryGridProps = {
  categories: Category[]
}

export default function CategoryGrid({ categories = [] }: CategoryGridProps) {
  // Garantir que categories seja sempre um array
  const safeCategories = Array.isArray(categories) ? categories : []

  if (safeCategories.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>Nenhuma categoria encontrada</p>
      </div>
    )
  }

  // Define a set of gradient backgrounds for categories
  const gradients = [
    "bg-gradient-to-br from-red-600 to-red-900", // Action
    "bg-gradient-to-br from-blue-600 to-blue-900", // Drama
    "bg-gradient-to-br from-purple-600 to-purple-900", // Kids & Family
    "bg-gradient-to-br from-orange-600 to-red-900", // Horror
    "bg-gradient-to-br from-green-600 to-green-900", // Sci-Fi
    "bg-gradient-to-br from-blue-600 to-purple-900", // Thriller
    "bg-gradient-to-br from-yellow-600 to-orange-900", // Comedy
    "bg-gradient-to-br from-yellow-400 to-yellow-700", // Oscars
  ]

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {safeCategories.map((category, index) => (
        <Link key={category.id} href={`/categorias/${category.slug}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`${gradients[index % gradients.length]} rounded-xl p-6 h-32 flex items-center justify-center`}
          >
            <h3 className="text-xl font-bold text-white text-center uppercase tracking-wider">{category.name}</h3>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}

