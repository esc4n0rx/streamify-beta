"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import FavoriteButton from "./FavoriteButton"

type Content = {
  id: string
  title: string
  poster_url: string
  category?: string
}

type ContentRowProps = {
  contents: Content[]
  aspectRatio: "portrait" | "landscape"
}

export default function ContentRow({ contents = [], aspectRatio }: ContentRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = direction === "left" ? -container.clientWidth / 2 : container.clientWidth / 2
    container.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  // Garantir que contents seja sempre um array
  const safeContents = Array.isArray(contents) ? contents : []

  if (safeContents.length === 0) {
    return null
  }

  return (
    <div className="relative group">
      <div ref={scrollContainerRef} className="flex overflow-x-auto hide-scrollbar gap-3 px-4 py-2">
        {safeContents.map((content) => (
          <Link
            key={content.id}
            href={`/conteudo/${content.id}`}
            className={`flex-shrink-0 ${aspectRatio === "portrait" ? "w-32" : "w-72"}`}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-lg"
            >
              <Image
                src={content.poster_url || "/placeholder.svg?height=400&width=300"}
                alt={content.title}
                width={aspectRatio === "portrait" ? 200 : 400}
                height={aspectRatio === "portrait" ? 300 : 225}
                className={`object-cover w-full ${aspectRatio === "portrait" ? "aspect-[2/3]" : "aspect-video"}`}
              />

              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton contentId={content.id} size="sm" />
              </div>

              {content.category && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-xs text-gray-300">{content.category}</div>
                  <div className="text-sm font-medium truncate">{content.title}</div>
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}

