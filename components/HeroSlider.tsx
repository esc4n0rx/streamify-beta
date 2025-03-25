"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface HeroItem {
  id: string
  title: string
  description: string
  poster_url: string
  category?: string
}

interface HeroSliderProps {
  items: HeroItem[]
}

export default function HeroSlider({ items }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  
  useEffect(() => {
    if (items.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length)
    }, 6000)
    
    return () => clearInterval(interval)
  }, [items.length])
  
  if (items.length === 0) {
    return null
  }
  
  const handleWatchClick = (id: string) => {
    router.push(`/content/${id}`)
  }
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }
  
  return (
    <div className="relative w-full h-[100vh] max-h-[600px] overflow-hidden">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={item.poster_url}
              alt={item.title}
              fill
              className="object-cover"
              priority={index === 0}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder-hero.png"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="max-w-4xl mx-auto">
                {item.category && (
                  <div className="mb-2 flex items-center">
                    <span className="text-red-600 font-bold text-sm mr-2 bg-red-600/20 px-1 rounded">
                      {item.category}
                    </span>
                  </div>
                )}
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{item.title}</h2>
                <p className="text-gray-300 mb-6 line-clamp-2 text-lg max-w-xl">
                  {item.description}
                </p>
                <button
                  onClick={() => handleWatchClick(item.id)}
                  className="bg-transparent text-white border py-2 px-6 rounded-full flex items-center hover:bg-white/10 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Assista Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Indicadores de slide, agora centralizados na parte inferior */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-gray-500 w-2 hover:bg-gray-400"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export function HeroSliderSkeleton() {
  return (
    <div className="relative w-full h-[100vh] max-h-[600px]">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 left-0 p-6 w-full">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-full max-w-xl mb-2" />
          <Skeleton className="h-6 w-full max-w-md mb-6" />
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>
      </div>
    </div>
  )
}