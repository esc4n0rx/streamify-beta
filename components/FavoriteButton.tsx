"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { addToFavorites } from "@/lib/content-service"
import { useToast } from "@/components/ui/use-toast"

type FavoriteButtonProps = {
  contentId: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function FavoriteButton({ 
  contentId, 
  size = "md", 
  className 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      // Toggle favorite status locally for immediate feedback
      const newStatus = !isFavorite
      setIsFavorite(newStatus)
      
      // Call API to update favorite status
      const success = await addToFavorites(contentId)
      
      if (!success) {
        // If API call fails, revert UI state
        setIsFavorite(!newStatus)
        throw new Error("Falha ao atualizar favoritos")
      }
      
      // Show success toast
      toast({
        title: newStatus ? "Adicionado aos favoritos" : "Removido dos favoritos",
        duration: 2000
      })
    } catch (error) {
      console.error("Erro ao gerenciar favoritos:", error)
      
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favoritos",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Determine size based on prop
  const iconSize = size === "sm" ? 16 : size === "lg" ? 24 : 20
  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default"

  return (
    <Button
      variant="ghost"
      size={buttonSize === "sm" ? "icon" : "icon"}
      className={cn(
        "rounded-full p-1 bg-black/40 backdrop-blur-sm hover:bg-black/60",
        isFavorite ? "text-red-500" : "text-white",
        buttonSize === "sm" ? "h-7 w-7" : buttonSize === "lg" ? "h-10 w-10" : "h-8 w-8",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          "transition-colors duration-200",
          isFavorite ? "fill-current" : ""
        )}
        size={iconSize}
      />
    </Button>
  )
}