// components/SeasonEpisodes.tsx
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Check } from "lucide-react";
import { Episode } from "@/lib/content-service-detail";

interface SeasonEpisodesProps {
  episodes: Episode[];
  contentId: string;
  seasonNumber: number;
  currentEpisode?: number;
  watchedEpisodes?: Set<string>;
}

const SeasonEpisodes = ({ 
  episodes, 
  contentId, 
  seasonNumber, 
  currentEpisode,
  watchedEpisodes = new Set()
}: SeasonEpisodesProps) => {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-4">
        <p>Nenhum episódio disponível para esta temporada.</p>
      </div>
    );
  }

  // Ordenar episódios por número
  const sortedEpisodes = [...episodes].sort((a, b) => {
    const epA = typeof a.episodio === 'string' ? parseInt(a.episodio, 10) : a.episodio;
    const epB = typeof b.episodio === 'string' ? parseInt(b.episodio, 10) : b.episodio;
    return epA - epB;
  });

  return (
    <div className="space-y-4">
      {sortedEpisodes.map((episode) => {
        // Extrair o número do episódio
        const episodeNumber = typeof episode.episodio === 'string' 
          ? parseInt(episode.episodio, 10) 
          : episode.episodio;

        // Verificar se este episódio está sendo reproduzido atualmente
        const isCurrentEpisode = currentEpisode === episodeNumber;
        
        // Verificar se este episódio foi assistido
        const isWatched = watchedEpisodes.has(`${seasonNumber}-${episodeNumber}`);
        
        // Determinar o título do episódio
        const episodeTitle = episode.title || `Episódio ${episodeNumber}`;
        
        // Usar a thumbnail do episódio, se disponível, ou um placeholder
        const thumbnail = episode.thumbnail || "/api/placeholder/640/360";

        return (
          <div 
            key={`${seasonNumber}-${episodeNumber}`}
            className={`p-3 rounded-lg transition-colors ${
              isCurrentEpisode ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Número do episódio */}
              <div className="flex-shrink-0 w-8 text-center">
                <span className={`font-medium ${isCurrentEpisode ? 'text-blue-400' : 'text-gray-400'}`}>
                  {episodeNumber}
                </span>
              </div>
              
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-24 aspect-video rounded overflow-hidden">
                <Image
                  src={thumbnail}
                  alt={episodeTitle}
                  fill
                  className="object-cover"
                />
                
                {/* Indicador de assistido */}
                {isWatched && (
                  <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
                    <Check size={10} />
                  </div>
                )}
              </div>
              
              {/* Título e duração */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{episodeTitle}</h4>
                {episode.duration && (
                  <p className="text-xs text-gray-400">
                    {Math.floor(episode.duration / 60)}m
                  </p>
                )}
              </div>
              
              {/* Botão de reprodução */}
              <Link 
                href={`/assistir/${contentId}?season=${seasonNumber}&episode=${episodeNumber}`}
                className="flex-shrink-0"
              >
                <PlayCircle 
                  className={`h-8 w-8 ${
                    isCurrentEpisode ? 'text-blue-400' : 'text-white/70 hover:text-white'
                  }`} 
                />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeasonEpisodes;