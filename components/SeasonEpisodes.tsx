"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PlayCircle, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Season } from "@/lib/content-service-detail"
import { markAsWatched } from "@/lib/content-service-detail"
import { useToast } from "@/components/ui/use-toast"

interface SeasonEpisodesProps {
  season: Season
  contentId: string
}

export default function SeasonEpisodes({ season, contentId }: SeasonEpisodesProps) {
  const [isMarking, setIsMarking] = useState<string | null>(null)
  const { toast } = useToast()
  const [selectedSeason, setSelectedSeason] = useState(season.number.toString())
  
  const handleMarkAsWatched = async (episodeId: string) => {
    setIsMarking(episodeId)
    try {
      const success = await markAsWatched(episodeId)
      if (success) {
        toast({
          title: "Marcado como assistido",
          duration: 2000
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como assistido",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsMarking(null)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Episódios</h2>
        <div className="w-40">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Temporada" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value={season.number.toString()}>
                Temporada {season.number}
              </SelectItem>
              {/* Aqui você poderia mapear outras temporadas se disponíveis */}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {season.episodes.map((episode) => (
          <div key={episode.id} className="bg-zinc-800 rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-48 h-32">
                <Image
                  src={episode.thumbnail || "/placeholder-episode.png"}
                  alt={episode.title || `Episódio ${episode.episodio}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/assistir/${contentId}?season=${season.number}&episode=${episode.episodio}`}
                  >
                    <Button size="icon" variant="ghost" className="rounded-full bg-white/20 backdrop-blur-sm w-12 h-12">
                      <PlayCircle size={24} />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Episódio {episode.episodio}</h3>
                    <p className="text-sm text-gray-400">{episode.title || `Episódio ${episode.episodio}`}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-8 w-8 bg-zinc-700"
                      onClick={() => handleMarkAsWatched(episode.id.toString())}
                      disabled={isMarking === episode.id.toString()}
                    >
                      {isMarking === episode.id.toString() ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-8 w-8 bg-zinc-700"
                      onClick={() => {
                        // Implementar download
                        // Usaria o endpoint /api/download com a URL do episódio
                        toast({
                          title: "Download iniciado",
                          description: `O episódio ${episode.episodio} começará a ser baixado`,
                          duration: 3000
                        })
                      }}
                    >
                      <Download size={16} />
                    </Button>
                  </div>
                </div>
                
                {episode.description && (
                  <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                    {episode.description}
                  </p>
                )}
                
                {episode.duration && (
                  <p className="text-xs text-gray-400 mt-2">
                    {Math.floor(episode.duration / 60)}min
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}