"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

type CategoryTagsProps = {
  onCategorySelect: (category: string) => void
  selectedCategory: string
}

const CATEGORIES = [
  { id: "LANÇAMENTOS", name: "Lançamentos", color: "bg-gradient-to-r from-red-500 to-orange-500" },
  { id: "POPULARES", name: "Populares", color: "bg-gradient-to-r from-blue-500 to-indigo-500" },
  { id: "AÇÃO", name: "Ação", color: "bg-gradient-to-r from-yellow-500 to-amber-500" },
  { id: "COMÉDIA", name: "Comédia", color: "bg-gradient-to-r from-green-500 to-emerald-500" },
  { id: "DRAMA", name: "Drama", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "TERROR", name: "Terror", color: "bg-gradient-to-r from-slate-700 to-slate-900" },
  { id: "ANIMAÇÃO", name: "Animação", color: "bg-gradient-to-r from-cyan-500 to-teal-500" },
  { id: "DOCUMENTÁRIOS", name: "Documentários", color: "bg-gradient-to-r from-neutral-500 to-neutral-700" }
]

export default function CategoryTags({
  onCategorySelect,
  selectedCategory = "LANÇAMENTOS"
}: CategoryTagsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = direction === "left" ? -200 : 200
    container.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  return (
    <div className="relative group px-4 mt-4">
      <div
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto hide-scrollbar py-2"
      >
        {CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
              category.id === selectedCategory
                ? `${category.color} text-white shadow-md`
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            {category.name}
          </motion.button>
        ))}
      </div>

      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}