"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import FavoriteButton from "./FavoriteButton"
import ContentGridSkeleton from "./skeletons/ContentGridSkeleton"

type Content = {
  id: string
  title: string
  poster_url: string
  category?: string
}

type ContentGridProps = {
  contents: Content[]
  aspectRatio: "portrait" | "landscape"
  itemsPerRow?: number
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
}

export default function ContentGrid({ 
  contents = [], 
  aspectRatio, 
  itemsPerRow = 5,
  onLoadMore,
  hasMore = false
}: ContentGridProps) {
  const [loading, setLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Garantir que contents seja sempre um array
  const safeContents = Array.isArray(contents) ? contents : []

  // Quando o usuário rolar até o final, carrega mais conteúdo
  useEffect(() => {
    if (!onLoadMore || !hasMore) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loading && hasMore) {
          setLoading(true)
          await onLoadMore()
          setLoading(false)
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [onLoadMore, hasMore, loading])

  // Organiza o conteúdo em linhas
  const contentRows = []
  for (let i = 0; i < safeContents.length; i += itemsPerRow) {
    contentRows.push(safeContents.slice(i, i + itemsPerRow))
  }

  if (safeContents.length === 0 && !loading) {
    return null
  }

  return (
    <div ref={containerRef} className="px-4 pb-4 space-y-4">
      {contentRows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {row.map((content) => (
            <Link
              key={content.id}
              href={`/conteudo/${content.id}`}
              className="block"
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

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  {content.category && (
                    <div className="text-xs text-gray-300">{content.category}</div>
                  )}
                  <div className="text-sm font-medium truncate">{content.title}</div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ))}

      {hasMore && (
        <div ref={loadMoreRef} className="pt-4 pb-2">
          {loading && <ContentGridSkeleton />}
        </div>
      )}
    </div>
  )
}