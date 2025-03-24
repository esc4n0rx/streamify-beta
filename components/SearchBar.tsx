"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { searchContent, ContentItem } from "@/lib/content-new"

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Abrir a barra de pesquisa
  const openSearch = () => {
    setIsOpen(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Fechar a barra de pesquisa
  const closeSearch = () => {
    setIsOpen(false)
    setSearchTerm("")
    setResults([])
  }

  // Lidar com cliques fora da barra de pesquisa
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSearch()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Buscar conteúdos quando o termo de pesquisa muda
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setLoading(true)
        try {
          const searchResults = await searchContent(searchTerm)
          setResults(searchResults)
        } catch (error) {
          console.error("Erro ao buscar:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchTerm])

  // Navegação ao selecionar um resultado
  const handleResultClick = (contentId: string) => {
    router.push(`/conteudo/${contentId}`)
    closeSearch()
  }

  return (
    <div className="relative" ref={searchContainerRef}>
      {/* Ícone de pesquisa */}
      <button
        onClick={openSearch}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Barra de pesquisa expandida */}
      {isOpen && (
        <div className="absolute top-0 right-0 w-screen sm:w-96 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
          <div className="flex items-center p-3 border-b">
            <Search className="h-5 w-5 mr-2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar filmes, séries..."
              className="flex-1 bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={closeSearch}>
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {/* Resultados da pesquisa */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-pulse text-sm">Buscando...</div>
              </div>
            ) : searchTerm.trim().length >= 2 && results.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              </div>
            ) : (
              results.map((content) => (
                <Link 
                  key={content.id} 
                  href={`/conteudo/${content.id}`}
                  onClick={() => closeSearch()}
                >
                  <div className="flex items-center p-2 hover:bg-muted/50 cursor-pointer">
                    <div className="relative h-16 w-12 mr-3 flex-shrink-0">
                      <Image
                        src={content.poster_url || "/placeholder.svg"}
                        alt={content.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{content.title}</h4>
                      {content.category && (
                        <p className="text-xs text-muted-foreground">{content.category}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}