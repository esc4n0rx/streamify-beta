"use client"

import { useEffect, useState } from "react"
import { getContentByCategory, ContentItem } from "@/lib/content-new"
import ContentRow from "./ContentRow"
import ContentRowSkeleton from "./skeletons/ContentRowSkeleton"

type SimilarContentProps = {
  category: string
  excludeId?: string
  title?: string
}

export default function SimilarContent({
  category,
  excludeId,
  title = "Conteúdos Similares"
}: SimilarContentProps) {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSimilarContent = async () => {
      setLoading(true)
      try {
        const { contents: similarContents } = await getContentByCategory(category, undefined, 1, 15)
        
        // Filtrar o conteúdo atual, se um ID for fornecido
        const filteredContents = excludeId
          ? similarContents.filter(content => content.id !== excludeId)
          : similarContents
          
        // Limitar a 10 itens e randomizar a ordem
        const randomizedContents = filteredContents
          .sort(() => 0.5 - Math.random())
          .slice(0, 10)
          
        setContents(randomizedContents)
      } catch (error) {
        console.error("Erro ao carregar conteúdos similares:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSimilarContent()
  }, [category, excludeId])

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold px-4 mb-3">{title}</h2>
        <ContentRowSkeleton />
      </div>
    )
  }

  if (contents.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold px-4 mb-3">{title}</h2>
      <ContentRow contents={contents} aspectRatio="portrait" />
    </div>
  )
}