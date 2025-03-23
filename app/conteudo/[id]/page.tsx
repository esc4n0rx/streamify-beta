"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import Avatar from "@/components/Avatar"
import { Button } from "@/components/ui/button"
import { PlayCircle, Plus } from "lucide-react"
import SeasonEpisodes from "@/components/SeasonEpisodes"
import ContentDetailSkeleton from "@/components/skeletons/ContentDetailSkeleton"
import { getContentDetail, ContentDetail } from "@/lib/content-service-detail"
import { addToList } from "@/lib/content-service"
import FavoriteButton from "@/components/FavoriteButton"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/AuthProvider"

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [content, setContent] = useState<ContentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isAddingToList, setIsAddingToList] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      if (isAuthenticated) {
        try {
          const data = await getContentDetail(id)
          setContent(data)
        } catch (error) {
          console.error("Erro ao buscar detalhes do conteúdo:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchContent()
  }, [id, isAuthenticated])

  const handleAddToList = async () => {
    if (isAddingToList || !id) return

    setIsAddingToList(true)
    try {
      const success = await addToList(id)
      
      if (success) {
        toast({
          title: "Adicionado à sua lista",
          duration: 2000
        })
      } else {
        throw new Error("Falha ao adicionar à lista")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar à sua lista",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsAddingToList(false)
    }
  }

  // Renderiza o esqueleto enquanto carrega
  if (loading) {
    return (
      <div className="pb-20">
        <ContentDetailSkeleton />
      </div>
    )
  }

  // Verificar se o conteúdo existe
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Conteúdo não encontrado</h2>
        <p className="text-gray-400">O conteúdo que você está procurando não está disponível.</p>
        <Link href="/" className="mt-4">
          <Button>Voltar para o início</Button>
        </Link>
      </div>
    )
  }

  // Garantir que todas as propriedades existam com valores padrão
  const {
    title = "Sem título",
    poster_url = "/placeholder.svg",
    category = "Sem categoria",
    release_date = "",
    duration = 0,
    description = "",
    type = "movie",
    current_season = 1,
    current_episode = 1,
    seasons = [],
  } = content

  const isSeries = type === "series"
  
  // Preparando o texto da descrição
  const truncatedDescription = description && description.length > 150 
    ? `${description.substring(0, 150)}...` 
    : description
  
  const displayDescription = showFullDescription 
    ? description 
    : truncatedDescription

  return (
    <div className="pb-20">
      <div className="relative h-[70vh]">
        <Image 
          src={poster_url || "/placeholder.svg"} 
          alt={title} 
          fill 
          className="object-cover" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black"></div>
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <Link href="/" className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-black/50 border-white/20"
              onClick={handleAddToList}
              disabled={isAddingToList}
            >
              <Plus size={18} />
            </Button>
            <Avatar />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <div className="flex justify-center items-center gap-2 text-sm text-gray-300 mb-4">
            <span>{category}</span>
            {release_date && (
              <>
                <span>•</span>
                <span>{release_date}</span>
              </>
            )}
            {duration > 0 && (
              <>
                <span>•</span>
                <span>{duration} min</span>
              </>
            )}
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">TV+</span>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row justify-center">
            <Link 
              href={isSeries 
                ? `/assistir/${id}?season=${current_season}&episode=${current_episode}` 
                : `/assistir/${id}`
              } 
              className="w-full lg:w-auto"
            >
              <Button className="w-full lg:w-auto lg:px-8 py-6 rounded-xl bg-white text-black hover:bg-white/90">
                <PlayCircle className="mr-2" size={20} />
                {isSeries ? `Play T${current_season}, E${current_episode}` : "Play"}
              </Button>
            </Link>
            <FavoriteButton contentId={id} size="lg" className="w-full lg:w-auto" />
          </div>
        </div>
      </div>
      <div className="p-4">
        {description && (
          <p className="text-gray-300 mb-4">
            {displayDescription}
            {description.length > 150 && (
              <button 
                className="text-blue-500 ml-1"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "menos" : "mais"}
              </button>
            )}
          </p>
        )}
        {isSeries && seasons && seasons.length > 0 && (
          <div className="mt-6">
            {seasons.map((season) => (
              <SeasonEpisodes 
                key={season.id} 
                season={season} 
                contentId={id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}