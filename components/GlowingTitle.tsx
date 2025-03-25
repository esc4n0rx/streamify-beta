"use client"

import { useEffect, useState, useRef } from "react"

interface GlowingTitleProps {
  text: string
}

export default function GlowingTitle({ text }: GlowingTitleProps) {
  const [glowPosition, setGlowPosition] = useState(-10) // Começa fora da tela
  const animationCompleted = useRef(false)
  
  useEffect(() => {
    if (animationCompleted.current) return
    
    // Calcula a duração baseada no comprimento do texto (mais caracteres = mais tempo)
    const animationDuration = Math.max(1500, text.length * 100)
    const interval = 20 // Atualização a cada 20ms para animação suave
    const steps = animationDuration / interval
    const increment = (100 + 20) / steps // +20 para garantir que vá até o final
    
    const timer = setInterval(() => {
      setGlowPosition(prev => {
        const newPosition = prev + increment
        if (newPosition >= 110) {
          clearInterval(timer)
          animationCompleted.current = true
          return 110 // Coloca a posição do glow fora da tela (fim do texto)
        }
        return newPosition
      })
    }, interval)
    
    return () => clearInterval(timer)
  }, [text])
  
  return (
    <h1 
      className="text-3xl font-bold relative inline-block"
      style={{
        background: `linear-gradient(
          90deg, 
          rgba(255,255,255,1) 0%, 
          rgba(255,255,255,1) ${glowPosition - 10}%, 
          rgba(59,130,246,1) ${glowPosition}%, 
          rgba(255,255,255,1) ${glowPosition + 10}%, 
          rgba(255,255,255,1) 100%
        )`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '200% 100%'
      }}
    >
      {text}
    </h1>
  )
}