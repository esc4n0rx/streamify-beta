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
  category?: string
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
      <div className="flex space-x-6 overflow-x-auto pb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleClick(item.id)}
          >
            <div className="relative">
              {/* Poster da imagem com borda arredondada */}
              <div className="w-64 h-36 relative rounded-xl overflow-hidden">
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
                
                {/* Logo do Apple TV+ no canto inferior direito */}
                <div className="absolute bottom-2 right-2">
                  <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5C9.5 5 5 9.5 5 15C5 20.5 9.5 25 15 25C20.5 25 25 20.5 25 15C25 9.5 20.5 5 15 5ZM12 20V10L20 15L12 20Z" fill="white"/>
                  </svg>
                </div>
              </div>
              
              {/* Informações abaixo do poster */}
              <div className="mt-3 flex">
                {/* Número de posição grande */}
                <div className="text-6xl font-bold text-gray-500 mr-4 -mt-1">
                  {item.position}
                </div>
                
                {/* Título e categoria */}
                <div className="flex flex-col max-w-[160px]">
                  <h3 className="text-lg font-bold text-white leading-tight truncate">{item.title}</h3>
                  {item.category && (
                    <span className="text-sm text-gray-400">{item.category}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RankingRowSkeleton() {
  return (
    <div className="px-4">
      <div className="flex space-x-6 overflow-x-auto pb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="w-64 h-36 rounded-xl" />
            <div className="mt-3 flex">
              <Skeleton className="w-10 h-14 mr-4" />
              <div className="flex flex-col">
                <Skeleton className="w-40 h-6 mb-2" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}