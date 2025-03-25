// components/RankingRow.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface RankingItem {
  id: string
  title: string
  poster_url: string
  position: number
}

interface RankingRowProps {
  items: RankingItem[]
}

export default function RankingRow({ items }: RankingRowProps) {
  const router = useRouter()

  if (!items || items.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-400">
        <p>Nenhum conteúdo no ranking disponível no momento.</p>
      </div>
    )
  }

  const handleClick = (id: string) => {
    router.push(`/content/${id}`)
  }

  return (
    <div className="px-4">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 relative"
            onClick={() => handleClick(item.id)}
          >
            <div className="relative">
              <div className="absolute -left-1 -top-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10 text-white font-bold shadow-lg">
                {item.position}
              </div>
              <div className="w-32 h-48 relative rounded-lg overflow-hidden">
                <Image
                  src={item.poster_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-poster.png"
                  }}
                />
              </div>
            </div>
            <div className="mt-2 w-32 truncate text-sm">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RankingRowSkeleton() {
  return (
    <div className="px-4">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 relative">
            <div className="absolute -left-1 -top-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10">
              <Skeleton className="w-4 h-4 rounded-full bg-blue-400" />
            </div>
            <Skeleton className="flex-shrink-0 w-32 h-48 rounded-lg" />
            <Skeleton className="mt-2 w-24 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}