"use client"

import { useEffect, useState } from "react"
import Avatar from "@/components/Avatar"
import ContentGrid from "@/components/ContentGrid"
import { useFavoritesStore } from "@/store/favoritesStore"
import { useQuery } from "@tanstack/react-query"
import { getTrending, getRecommendations, getLatest } from "@/lib/api"

type Content = {
  id: string
  title: string
  poster_url: string
  category?: string
}

export default function Favoritos() {
  const { favorites } = useFavoritesStore()
  const [favoriteContents, setFavoriteContents] = useState<Content[]>([])

  // Buscar todos os conteúdos disponíveis para filtrar os favoritos
  const { data: trendingData } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
  })

  const { data: recommendationsData } = useQuery({
    queryKey: ["recommendations"],
    queryFn: getRecommendations,
  })

  const { data: latestData } = useQuery({
    queryKey: ["latest"],
    queryFn: getLatest,
  })

  useEffect(() => {
    // Combinar todos os conteúdos disponíveis
    const allContents: Content[] = [
      ...(Array.isArray(trendingData) ? trendingData : []),
      ...(Array.isArray(recommendationsData) ? recommendationsData : []),
      ...(Array.isArray(latestData) ? latestData : []),
    ]

    // Filtrar apenas os conteúdos favoritos
    const favContents = allContents.filter((content) => favorites.includes(content.id))

    // Remover duplicatas (baseado no ID)
    const uniqueFavs = favContents.filter(
      (content, index, self) => index === self.findIndex((c) => c.id === content.id),
    )

    setFavoriteContents(uniqueFavs)
  }, [favorites, trendingData, recommendationsData, latestData])

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center p-4 pt-6">
        <h1 className="text-3xl font-bold">Favoritos</h1>
        <Avatar />
      </div>

      {favoriteContents.length > 0 ? (
        <ContentGrid contents={favoriteContents} />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
          <div className="bg-zinc-800 p-4 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
          <p className="text-gray-400 max-w-md">
            Adicione conteúdos aos seus favoritos clicando no ícone de coração nos cards ou na página de detalhes.
          </p>
        </div>
      )}
    </div>
  )
}

