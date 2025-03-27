"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/AuthProvider"
import { getChannelContent, getChannelHighlights, getAvailableChannels } from "@/lib/ranking-channel-service"
import GlowingTitle from "@/components/GlowingTitle"

// Componente para o Hero Slider
const HeroSlider = ({ 
  items 
}: { 
  items: Array<{id: string, title: string, description: string, poster_url: string}> 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  
  useEffect(() => {
    if (items.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [items.length])
  
  if (items.length === 0) return null
  
  const handleCardClick = (id: string) => {
    router.push(`/conteudo/${id}`)
  }
  
  return (
    <div className="relative w-full h-64 md:h-80">
      {items.map((item, index) => (
        <div 
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full cursor-pointer" onClick={() => handleCardClick(item.id)}>
            <Image
              src={item.poster_url}
              alt={item.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder-poster.png"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 w-full">
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-300 line-clamp-2">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
      
      {items.length > 1 && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {items.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Componentes de Skeleton para carregamento
const HeroSkeleton = () => (
  <Skeleton className="w-full h-64 md:h-80" />
)

// Componente de Skeleton para card de conteúdo
const ContentCardSkeleton = () => (
  <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
    <Skeleton className="w-full h-full" />
    <Skeleton className="h-4 w-3/4 mt-2" />
  </div>
)

export default function ChannelPage() {
  const params = useParams()
  const channelId = params.id as string
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [channelName, setChannelName] = useState("")
  const [highlights, setHighlights] = useState<Array<{
    id: string
    title: string
    description: string
    poster_url: string
  }>>([])
  const [contents, setContents] = useState<Array<{
    id: string
    title: string
    poster_url: string
    category?: string
    has_episodes: boolean
  }>>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const itemsPerPage = 20 
  
  useEffect(() => {
    const fetchChannelData = async () => {
      if (isAuthenticated) {
        setLoading(true)
        setPage(1) 
        
        try {
          // Encontre o nome do canal pelo ID
          const channels = getAvailableChannels()
          const channel = channels.find(c => c.id === channelId)
          
          if (channel) {
            setChannelName(channel.name)
            
            // Buscar highlights para o hero slider
            const highlightsData = await getChannelHighlights(channelId)
            console.log("Highlights data:", highlightsData)
            setHighlights(highlightsData)
            
            // Buscar conteúdos do canal (primeira página)
            const { contents: channelContents, hasMore: moreAvailable, totalPages: pages } = 
              await getChannelContent(channelId, 1, itemsPerPage)
            
            console.log("Channel contents:", channelContents)
            setContents(channelContents)
            setHasMore(moreAvailable)
            setTotalPages(pages)
          }
        } catch (error) {
          console.error("Erro ao buscar dados do canal:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    
    fetchChannelData()
  }, [channelId, isAuthenticated, itemsPerPage])
  
  const loadMoreContent = async () => {
    if (!hasMore || loadingMore) return
    
    setLoadingMore(true)
    const nextPage = page + 1
    
    try {
      const { contents: moreContents, hasMore: moreAvailable } = 
        await getChannelContent(channelId, nextPage, itemsPerPage)
      
      if (moreContents.length > 0) {
        setContents(prev => [...prev, ...moreContents])
        setPage(nextPage)
        setHasMore(moreAvailable)
      } else {
        // Se não retornou conteúdos, provavelmente chegamos ao fim
        setHasMore(false)
      }
    } catch (error) {
      console.error("Erro ao carregar mais conteúdos:", error)
    } finally {
      setLoadingMore(false)
    }
  }
  
  const handleContentClick = (id: string) => {
    router.push(`/content/${id}`)
  }
  
  return (
    <div className="pb-20">
      <div className="p-4 pt-6">
        {loading ? (
          <Skeleton className="h-10 w-40" />
        ) : (
          <GlowingTitle text={channelName} />
        )}
      </div>
      
      {loading ? (
        <HeroSkeleton />
      ) : highlights.length > 0 ? (
        <div className="mb-6">
          <HeroSlider items={highlights} />
        </div>
      ) : (
        <div className="mb-6 px-4 py-6 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg">
          <p>Nenhum destaque disponível para este canal.</p>
        </div>
      )}
      
      <section className="mt-4">
        <h2 className="text-2xl font-semibold px-4 mb-3">Séries</h2>
        {loading ? (
          <div className="px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : contents.length > 0 ? (
          <>
            <div className="px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {contents.map((content) => (
                  <div 
                    key={content.id} 
                    className="relative cursor-pointer"
                    onClick={() => handleContentClick(content.id)}
                  >
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-800">
                      <Image
                        src={content.poster_url}
                        alt={content.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder-poster.png"
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="bg-blue-500 rounded-full p-3">
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
                            className="text-white"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                      {content.has_episodes && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                          Série
                        </div>
                      )}
                    </div>
                    <div className="mt-2 truncate">{content.title}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full flex items-center"
                  onClick={loadMoreContent}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span className="mr-2">Carregando</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    'Carregar mais'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="px-4 py-8 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg mx-4">
            <p>Nenhum conteúdo disponível para este canal.</p>
          </div>
        )}
      </section>
    </div>
  )
}