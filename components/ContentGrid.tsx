"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import FavoriteButton from "./FavoriteButton"

type Content = {
  id: string
  title: string
  poster_url: string
  category?: string
}

type ContentGridProps = {
  contents: Content[]
}

export default function ContentGrid({ contents = [] }: ContentGridProps) {
  // Garantir que contents seja sempre um array
  const safeContents = Array.isArray(contents) ? contents : []

  if (safeContents.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>Nenhum conteúdo encontrado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {safeContents.map((content) => (
        <Link key={content.id} href={`/conteudo/${content.id}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-lg"
          >
            <Image
              src={content.poster_url || "/placeholder.svg?height=400&width=300"}
              alt={content.title}
              width={200}
              height={300}
              className="object-cover w-full aspect-[2/3]"
            />

            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton contentId={content.id} size="sm" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              {content.category && <div className="text-xs text-gray-300">{content.category}</div>}
              <div className="text-sm font-medium truncate">{content.title}</div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}

