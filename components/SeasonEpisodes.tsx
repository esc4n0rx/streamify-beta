"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ChevronUp, Download, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Episode, Season } from "@/lib/content-service-detail"

// Tipo do props adaptado para receber o formato de temporada da API
type SeasonEpisodesProps = {
  season: Season
  contentId: string // ID do conteúdo para construir a URL correta
}

export default function SeasonEpisodes({ season, contentId }: SeasonEpisodesProps) {
  const [isExpanded, setIsExpanded] = useState(season.number === 1)

  // Ordenar episódios por número
  const sortedEpisodes = [...season.episodes].sort((a, b) => {
    return parseInt(a.episodio) - parseInt(b.episodio);
  });

  return (
    <div className="mb-6">
      <button
        className="flex items-center justify-between w-full py-2 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-semibold">Temporada {season.number}</h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 mt-2">
              {sortedEpisodes.map((episode) => (
                <div key={episode.id} className="flex border-b border-zinc-800 pb-4">
                  <div className="w-24 h-16 relative flex-shrink-0">
                    <Image
                      src={episode.thumbnail || "/placeholder.svg?height=200&width=300"}
                      alt={episode.title || `Episódio ${episode.episodio}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-medium">
                        {episode.title || `Episódio ${episode.episodio}`}
                      </h4>
                      <div className="flex items-center">
                        <button 
                          className="text-gray-400 hover:text-blue-500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Iniciar download usando proxy
                            const token = localStorage.getItem('streamify_token');
                            if (token && episode.url) {
                              window.open(
                                `https://api.streamhivex.icu/api/download?url=${encodeURIComponent(episode.url)}&token=${token}`,
                                '_blank'
                              );
                            }
                          }}
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      EP {episode.episodio} • T{episode.temporada}
                      {episode.duration && ` • ${episode.duration} min`}
                    </div>
                    {episode.description && (
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                        {episode.description}
                      </p>
                    )}
                  </div>

                  <Link 
                    href={`/assistir/${contentId}?season=${season.number}&episode=${episode.episodio}`} 
                    className="ml-2 self-center"
                  >
                    <Play size={20} />
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}