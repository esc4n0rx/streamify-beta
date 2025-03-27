// components/MultiSeasonEpisodes.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, PlayCircle, Download, Check } from "lucide-react";
import { Season } from "@/lib/content-service-detail";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MultiSeasonEpisodesProps {
  seasons: Season[];
  contentId: string;
  currentSeason?: number;
}

const EpisodeCard = ({
  episode,
  contentId,
  seasonNumber,
  isPlaying = false,
  isWatched = false
}: {
  episode: any;
  contentId: string;
  seasonNumber: number;
  isPlaying?: boolean;
  isWatched?: boolean;
}) => {
  // Extrair o número do episódio para exibição
  const episodeNumber = typeof episode.episodio === 'string' 
    ? parseInt(episode.episodio, 10) 
    : episode.episodio;

  // Determinar o título do episódio
  const episodeTitle = episode.title || `Episódio ${episodeNumber}`;
  
  // Usar a thumbnail do episódio, se disponível, ou um placeholder
  const thumbnail = episode.thumbnail || "/api/placeholder/640/360";

  return (
    <div className={`mb-6 p-4 rounded-xl transition-colors ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail do episódio */}
        <div className="relative w-full sm:w-64 aspect-video rounded-lg overflow-hidden">
          <Image
            src={thumbnail}
            alt={episodeTitle}
            fill
            className="object-cover"
          />
          
          {/* Indicador de assistido */}
          {isWatched && (
            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
              <Check size={16} />
            </div>
          )}
          
          {/* Overlay de play */}
          <Link 
            href={`/assistir/${contentId}?season=${seasonNumber}&episode=${episodeNumber}`}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
          </Link>
        </div>
        
        {/* Informações do episódio */}
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">
                {episodeTitle}
              </h3>
              <p className="text-sm text-gray-400">
                {episode.duration ? `${Math.floor(episode.duration / 60)}m` : ""}
              </p>
            </div>
            
            {/* Botão de download */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
            >
              <Download size={20} />
            </Button>
          </div>
          
          {/* Descrição do episódio */}
          {episode.description && (
            <p className="text-sm text-gray-300 mt-2 line-clamp-3">
              {episode.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const MultiSeasonEpisodes = ({ seasons, contentId, currentSeason = 1 }: MultiSeasonEpisodesProps) => {
  const [selectedSeason, setSelectedSeason] = useState<string>(currentSeason.toString());
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Simular episódios assistidos (em produção, isso viria da API)
    const watched = new Set<string>();
    // Aqui você poderia buscar da API quais episódios foram assistidos
    setWatchedEpisodes(watched);
  }, []);
  
  // Encontrar a temporada selecionada
  const activeSeason = seasons.find(s => s.number.toString() === selectedSeason);
  
  if (!seasons || seasons.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Nenhum episódio disponível.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Seletor de temporada */}
      <div className="mb-6">
        <Select
          value={selectedSeason}
          onValueChange={setSelectedSeason}
        >
          <SelectTrigger className="w-full md:w-64 bg-zinc-900/70 border-zinc-700">
            <SelectValue placeholder="Selecione a temporada" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {seasons.map((season) => (
              <SelectItem 
                key={season.id} 
                value={season.number.toString()}
                className="hover:bg-zinc-800"
              >
                {season.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Lista de episódios */}
      <div className="space-y-1">
        {activeSeason && activeSeason.episodes
          .sort((a, b) => {
            // Ordenar por número de episódio
            const epA = typeof a.episodio === 'string' ? parseInt(a.episodio, 10) : a.episodio;
            const epB = typeof b.episodio === 'string' ? parseInt(b.episodio, 10) : b.episodio;
            return epA - epB;
          })
          .map((episode) => (
            <EpisodeCard
              key={`${activeSeason.number}-${episode.episodio}`}
              episode={episode}
              contentId={contentId}
              seasonNumber={activeSeason.number}
              isWatched={watchedEpisodes.has(`${activeSeason.number}-${episode.episodio}`)}
              isPlaying={
                activeSeason.number === currentSeason && 
                episode.episodio.toString() === currentSeason.toString()
              }
            />
          ))}
      </div>
    </div>
  );
};

export default MultiSeasonEpisodes;