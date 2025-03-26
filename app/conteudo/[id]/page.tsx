"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { PlayCircle, Plus, Download, ChevronRight, X, Info, Share2 } from "lucide-react";
import SeasonEpisodes from "@/components/SeasonEpisodes";
import ContentDetailSkeleton from "@/components/skeletons/ContentDetailSkeleton";
import { getContentDetail, ContentDetail } from "@/lib/content-service-detail";
import { addToList } from "@/lib/content-service";
import FavoriteButton from "@/components/FavoriteButton";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import MultiSeasonEpisodes from "@/components/MultiSeasonEpisodes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getTMDBContentData, TMDBVideo, TMDBMovie, TMDBCredit } from "@/lib/tmdb-service";

// Componente para tags de qualidade
const QualityTags = () => {
  return (
    <div className="flex space-x-2 mt-2 justify-center">
      <div className="flex items-center justify-center h-6 w-6 bg-zinc-700 rounded text-xs text-white font-medium">4K</div>
      <div className="flex items-center justify-center h-6 px-2 bg-zinc-700 rounded text-[10px] text-white font-medium tracking-wide">
        DOLBY<br />VISION
      </div>
      <div className="flex items-center justify-center h-6 px-2 bg-zinc-700 rounded text-[10px] text-white font-medium tracking-wide">
        DOLBY<br />ATMOS
      </div>
      <div className="flex items-center justify-center h-6 w-8 bg-zinc-700 rounded text-xs text-white font-medium">CC</div>
      <div className="flex items-center justify-center h-6 w-8 bg-zinc-700 rounded text-xs text-white font-medium">SDH</div>
      <div className="flex items-center justify-center h-6 w-8 bg-zinc-700 rounded text-xs text-white font-medium">AD</div>
    </div>
  );
};

// Componente para card de trailer
const TrailerCard = ({
  video,
  onClick,
  thumbnail
}: {
  video: TMDBVideo;
  onClick: () => void;
  thumbnail: string;
}) => {
  return (
    <div
      className="relative w-80 min-w-80 h-44 rounded-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <Image
        src={thumbnail || "/api/placeholder/640/360"}
        alt={video.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors flex items-center justify-center">
        <div className="h-14 w-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <PlayCircle className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
        <p className="text-white text-sm font-medium truncate">{video.name}</p>
      </div>
    </div>
  );
};

// Componente para card de ator
const ActorCard = ({ actor }: { actor: TMDBCredit }) => {
  const imageUrl = actor.profile_path
    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
    : '/placeholder-avatar.png';

  return (
    <div className="min-w-[120px] w-[120px]">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
        <Image
          src={imageUrl}
          alt={actor.name}
          fill
          className="object-cover"
        />
      </div>
      <p className="font-medium text-sm truncate">{actor.name}</p>
      {actor.character && (
        <p className="text-white/70 text-xs truncate">{actor.character}</p>
      )}
    </div>
  );
};

// Componente para modal de trailer
const TrailerModal = ({
  isOpen,
  onClose,
  video
}: {
  isOpen: boolean;
  onClose: () => void;
  video: TMDBVideo | null;
}) => {
  if (!video) return null;

  const youtubeUrl = `https://www.youtube.com/embed/${video.key}?autoplay=1&enablejsapi=1`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 bg-black border-none overflow-hidden">
        <button
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/70 flex items-center justify-center text-white"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div className="relative h-[calc(56.25vw-2rem)] max-h-[calc(100vh-6rem)] w-full">
          <iframe
            src={youtubeUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isAddingToList, setIsAddingToList] = useState(false);

  // Dados do TMDB
  const [tmdbData, setTmdbData] = useState<{
    id: number;
    details: TMDBMovie | null;
    videos: TMDBVideo[];
    credits: { cast: TMDBCredit[], crew: TMDBCredit[] } | null;
    contentRating: string;
  } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<TMDBVideo | null>(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (isAuthenticated) {
        try {
          const data = await getContentDetail(id);
          setContent(data);

          if (data?.title) {
            // Buscar dados adicionais do TMDB
            const tmdbResults = await getTMDBContentData(data.title, data.type === 'series');
            if (tmdbResults) {
              setTmdbData(tmdbResults);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar detalhes do conteúdo:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id, isAuthenticated]);

  const handleAddToList = async () => {
    if (isAddingToList || !id) return;
    setIsAddingToList(true);
    try {
      const success = await addToList(id);

      if (success) {
        toast({
          title: "Adicionado à sua lista",
          duration: 2000
        });
      } else {
        throw new Error("Falha ao adicionar à lista");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar à sua lista",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsAddingToList(false);
    }
  };

  const openTrailer = (video: TMDBVideo) => {
    setSelectedVideo(video);
    setIsTrailerModalOpen(true);
  };

  const closeTrailer = () => {
    setIsTrailerModalOpen(false);
    setSelectedVideo(null);
  };

  // Renderiza o esqueleto enquanto carrega
  if (loading) {
    return (
      <div className="pb-20">
        <ContentDetailSkeleton />
      </div>
    );
  }

  // Verificar se o conteúdo existe
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Conteúdo não encontrado</h2>
        <p className="text-gray-400">O conteúdo que você está procurando não está disponível.</p>
        <Link href="/" className="mt-4">
          <Button>Voltar para o início</Button>
        </Link>
      </div>
    );
  }

  // Garantir que todas as propriedades existam com valores padrão
  const {
    title = "Sem título",
    poster_url = "/placeholder.svg",
    category = "Sem categoria",
    release_date = "",
    duration = 0,
    description = "",
    type = "movie",
    current_season = 1,
    current_episode = 1,
    seasons = [],
  } = content;
  const isSeries = type === "series";

  // Preparando o texto da descrição
  const truncatedDescription = description && description.length > 150 
    ? `${description.substring(0, 150)}...`
    : description;
  
  const displayDescription = showFullDescription 
    ? description 
    : truncatedDescription;
  // Obter o ano de lançamento
  const releaseYear = release_date 
    ? new Date(release_date).getFullYear() 
    : (tmdbData?.details?.release_date ? new Date(tmdbData.details.release_date).getFullYear() : "");

  // Formatar duração em horas e minutos
  const formatDuration = (minutes: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours} h` : ""} ${mins > 0 ? `${mins} min` : ""}`.trim();
  };

  // Obter duração do TMDB se disponível
  const tmdbDuration = tmdbData?.details?.runtime || duration;

  // Obter classificação indicativa
  const contentRating = tmdbData?.contentRating || "";

  // Obter videos/trailers
  const videos = tmdbData?.videos || [];

  // Obter elenco
  const cast = tmdbData?.credits?.cast || [];

  // Obter gêneros
  const genres = tmdbData?.details?.genres?.map(g => g.name).join(", ") || category;

  return (
    <div className="pb-20">
      {/* Hero Banner */}
      <div className="relative h-[70vh]">
        <Image 
          src={poster_url || "/placeholder.svg"} 
          alt={title} 
          fill 
          className="object-cover" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black"></div>
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <Link href="/" className="text-white">
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
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-black/50 border-white/20"
              onClick={handleAddToList}
              disabled={isAddingToList}
            >
              <Plus size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-black/50 border-white/20"
            >
              <Share2 size={18} />
            </Button>
            <Avatar />
          </div>
        </div>
        
        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          
          <div className="flex justify-center items-center gap-2 text-sm text-gray-300 mb-1">
            <span>{genres}</span>
            {releaseYear && (
              <>
                <span>•</span>
                <span>{releaseYear}</span>
              </>
            )}
            {tmdbDuration > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(tmdbDuration)}</span>
              </>
            )}
            {contentRating && (
              <>
                <span>•</span>
                <span>{contentRating}</span>
              </>
            )}
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">TV+</span>
          </div>
          
          {/* Tags de Qualidade */}
          <QualityTags />
          
          {/* Botões de Ação */}
          <div className="flex flex-col gap-2 lg:flex-row justify-center mt-4">
            <Link 
              href={isSeries 
                ? `/assistir/${id}?season=${current_season}&episode=${current_episode}` 
                : `/assistir/${id}`
              } 
              className="w-full lg:w-auto"
            >
              <Button className="w-full lg:w-auto lg:px-8 py-6 rounded-xl bg-white text-black hover:bg-white/90">
                <PlayCircle className="mr-2" size={20} />
                {isSeries ? `Play T${current_season}, E${current_episode}` : "Reproduzir"}
              </Button>
            </Link>
            <FavoriteButton contentId={id} size="lg" className="w-full lg:w-auto" />
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full lg:w-auto rounded-xl border-white/20 bg-black/30 hover:bg-black/50"
            >
              <Download className="mr-2" size={20} />
              Download
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="p-4">
        {/* Sinopse */}
        {description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Sinopse</h2>
            <p className="text-gray-300">
              {displayDescription}
              {description.length > 150 && (
                <button 
                  className="text-blue-500 ml-1"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? "menos" : "mais"}
                </button>
              )}
            </p>
          </div>
        )}
        
        {/* Seção de Trailers */}
        {videos.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Trailers</h2>
              {videos.length > 3 && (
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  Ver todos <ChevronRight size={16} />
                </Button>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {videos.map((video) => (
                <TrailerCard 
                  key={video.id} 
                  video={video} 
                  onClick={() => openTrailer(video)}
                  thumbnail={tmdbData?.id ? `https://img.youtube.com/vi/${video.key}/hqdefault.jpg` : "/api/placeholder/640/360"}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Seção de Elenco */}
        {cast.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Elenco</h2>
              {cast.length > 5 && (
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  Ver todos <ChevronRight size={16} />
                </Button>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {cast.slice(0, 10).map((actor) => (
                <ActorCard key={actor.id} actor={actor} />
              ))}
            </div>
          </div>
        )}
        
        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Informações</h2>
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Gênero</span>
                <span>{genres}</span>
              </div>
              {releaseYear && (
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Ano</span>
                  <span>{releaseYear}</span>
                </div>
              )}
              {tmdbDuration > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Duração</span>
                  <span>{formatDuration(tmdbDuration)}</span>
                </div>
              )}
              {contentRating && (
                <div className="flex justify-between">
                  <span className="text-white/70">Classificação</span>
                  <span>{contentRating}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Disponibilidade</h2>
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Resolução</span>
                <span>4K (HDR)</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Áudio</span>
                <span>Dolby Atmos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Idiomas</span>
                <span>Português, Inglês</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Episódios (para séries) */}
        {isSeries && seasons && seasons.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Episódios</h2>
            <MultiSeasonEpisodes 
              seasons={seasons} 
              contentId={id}
              currentSeason={current_season}
            />
          </div>
        )}
      </div>
      
      {/* Modal de Trailer */}
      <TrailerModal 
        isOpen={isTrailerModalOpen} 
        onClose={closeTrailer} 
        video={selectedVideo} 
      />
    </div>
  );
}
