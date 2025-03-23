"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type HeroItem = {
  id: string
  title: string
  description: string
  poster_url: string
}

type HeroSliderProps = {
  items: HeroItem[]
}

export default function HeroSlider({ items = [] }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Garantir que items seja sempre um array
  const safeItems = Array.isArray(items) ? items : []

  const startAutoplay = () => {
    if (safeItems.length <= 1) return

    intervalRef.current = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % safeItems.length)
    }, 5000)
  }

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  useEffect(() => {
    startAutoplay()
    return () => stopAutoplay()
  }, [safeItems.length])

  const handlePrevious = () => {
    if (safeItems.length <= 1) return

    stopAutoplay()
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + safeItems.length) % safeItems.length)
    startAutoplay()
  }

  const handleNext = () => {
    if (safeItems.length <= 1) return

    stopAutoplay()
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % safeItems.length)
    startAutoplay()
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  if (safeItems.length === 0) {
    return null
  }

  const currentItem = safeItems[currentIndex]

  return (
    <div className="relative h-[50vh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={currentItem.poster_url || "/placeholder.svg?height=600&width=400"}
            alt={currentItem.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">{currentItem.title}</h2>
            <p className="text-sm text-gray-300 line-clamp-2">{currentItem.description}</p>
            <Link href={`/conteudo/${currentItem.id}`} className="inline-block mt-4">
              <Button className="bg-white text-black hover:bg-white/90">Assistir Agora</Button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {safeItems.length > 1 && (
        <>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {safeItems.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                onClick={() => {
                  stopAutoplay()
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                  startAutoplay()
                }}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  )
}

