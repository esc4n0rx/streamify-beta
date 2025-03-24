"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import ContentRow from "@/components/ContentRow"
import ContentRowSkeleton from "@/components/skeletons/ContentRowSkeleton"
import ContentFilter from "@/components/ContentFilter"
import CategoryTags from "@/components/CategoryTags"
import NoResults from "@/components/NoResults"
import { ContentItem, getLatest, getContentByCategory } from "@/lib/content-new"

export default function InfiniteContentRow() {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState("LANÇAMENTOS")
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const loadMoreContents = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      const { contents: newContents, hasMore: moreAvailable } = 
        category === "LANÇAMENTOS" && !subcategory
          ? await getLatest(page, 10)
          : await getContentByCategory(category, subcategory, page, 10)
      
      setContents(prev => [...prev, ...newContents])
      setHasMore(moreAvailable)
      setPage(prev => prev + 1)
    } catch (error) {
      console.error("Erro ao carregar mais conteúdos:", error)
    } finally {
      setLoading(false)
    }
  }, [page, loading, category, subcategory])

  // Função para dividir o array de conteúdos em grupos para exibição em diferentes linhas
  const getContentGroups = () => {
    const groups = []
    const itemsPerRow = 10 // Quantidade de itens por linha
    
    for (let i = 0; i < contents.length; i += itemsPerRow) {
      groups.push(contents.slice(i, i + itemsPerRow))
    }
    
    return groups
  }

  const handleFilterChange = useCallback((newCategory: string, newSubcategory?: string) => {
    // Resetar estado quando os filtros mudarem
    setCategory(newCategory)
    setSubcategory(newSubcategory)
    setContents([])
    setPage(1)
    setHasMore(true)
    setLoading(true)
  }, [])
  
  const handleCategorySelect = useCallback((newCategory: string) => {
    // Quando uma categoria é selecionada a partir das tags
    setCategory(newCategory)
    setSubcategory(undefined)
    setContents([])
    setPage(1)
    setHasMore(true)
    setLoading(true)
  }, [])

  useEffect(() => {
    // Carregar conteúdos iniciais
    const loadInitialContents = async () => {
      try {
        const { contents: initialContents, hasMore: moreAvailable } = 
          category === "LANÇAMENTOS" && !subcategory
            ? await getLatest(1, 10)
            : await getContentByCategory(category, subcategory, 1, 10)
        
        setContents(initialContents)
        setHasMore(moreAvailable)
        setPage(2) // Próxima página será a 2
      } catch (error) {
        console.error("Erro ao carregar conteúdos iniciais:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialContents()
  }, [category, subcategory])

  useEffect(() => {
    // Configurar o IntersectionObserver para detectar quando o usuário rola até o final
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreContents()
        }
      },
      { threshold: 0.1 }
    )
    
    observerRef.current = observer
    
    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, loadMoreContents])

  const contentGroups = getContentGroups()

  return (
    <div>
      <CategoryTags 
        onCategorySelect={handleCategorySelect}
        selectedCategory={category}
      />
      
      <ContentFilter 
        onFilterChange={handleFilterChange}
        selectedCategory={category}
        selectedSubcategory={subcategory}
      />
      
      {loading && contents.length === 0 ? (
        <div className="py-4">
          <ContentRowSkeleton />
          <ContentRowSkeleton />
        </div>
      ) : contents.length === 0 ? (
        <NoResults 
          message="Nenhum conteúdo encontrado para estes filtros" 
          resetFilters={() => handleCategorySelect("LANÇAMENTOS")}
        />
      ) : (
        <div className="space-y-6">
          {contentGroups.map((group, index) => (
            <div key={index} className="mb-4">
              <ContentRow contents={group} aspectRatio="portrait" />
            </div>
          ))}
          
          {hasMore && (
            <div ref={loadingRef} className="py-4">
              {loading && <ContentRowSkeleton />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}