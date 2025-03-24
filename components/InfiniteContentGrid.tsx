"use client"

import { useState, useCallback, useEffect } from "react"
import ContentGrid from "./ContentGrid"
import ContentRowSkeleton from "./skeletons/ContentRowSkeleton"
import { getLatest, ContentItem } from "@/lib/content-new"

type InfiniteContentGridProps = {
  initialContents?: ContentItem[]
  initialHasMore?: boolean
  aspectRatio?: "portrait" | "landscape"
  itemsPerRow?: number
}

export default function InfiniteContentGrid({
  initialContents = [],
  initialHasMore = true,
  aspectRatio = "portrait",
  itemsPerRow = 5
}: InfiniteContentGridProps) {
  const [contents, setContents] = useState<ContentItem[]>(initialContents)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(initialContents.length > 0 ? 2 : 1)
  const [loading, setLoading] = useState(false)

  // Carrega conteúdo inicial se não houver conteúdo fornecido
  useEffect(() => {
    if (initialContents.length === 0) {
      loadMoreContent()
    }
  }, [initialContents.length])

  // Função para carregar mais conteúdo
  const loadMoreContent = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      console.log(`Carregando página ${page}...`)
      const { contents: newContents, hasMore: moreAvailable } = await getLatest(page, itemsPerRow * 2)
      
      if (newContents.length > 0) {
        setContents(prev => [...prev, ...newContents])
        setPage(prev => prev + 1)
      }
      
      setHasMore(moreAvailable)
    } catch (error) {
      console.error("Erro ao carregar mais conteúdo:", error)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore, itemsPerRow])

  if (contents.length === 0 && loading) {
    return (
      <div className="space-y-4">
        <ContentRowSkeleton />
        <ContentRowSkeleton />
      </div>
    )
  }

  return (
    <ContentGrid
      contents={contents}
      aspectRatio={aspectRatio}
      itemsPerRow={itemsPerRow}
      onLoadMore={loadMoreContent}
      hasMore={hasMore}
    />
  )
}