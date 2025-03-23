"use client"

import { useEffect, useRef, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Airplay, Subtitles, SkipBack, Play, Pause, SkipForward, Maximize } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { getContentDetail, saveWatchProgress, markAsWatched } from "@/lib/content-service-detail"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/components/ui/use-toast"

export default function WatchContent({ params }: { params: Promise<{ id: string }> }) {
  // Desempacota o parâmetro ID usando use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter()
  const searchParams = useSearchParams()
  const seasonParam = searchParams.get('season')
  const episodeParam = searchParams.get('episode')
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [title, setTitle] = useState("")
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const proxyBaseUrl = "https://api.streamhivex.icu/api/download?url="

  // Buscar detalhes do conteúdo
  useEffect(() => {
    const fetchContent = async () => {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }
      
      try {
        const content = await getContentDetail(id);
        if (!content) {
          setLoadingError(true);
          return;
        }

        setTitle(content.title);

        // Se for uma série e tiver temporadas
        if (content.type === "series" && content.seasons && content.seasons.length > 0) {
          const seasonNumber = seasonParam || content.current_season?.toString() || "1";
          const episodeNumber = episodeParam || content.current_episode?.toString() || "1";
          
          // Encontrar a temporada e episódio corretos
          const season = content.seasons.find(s => s.number.toString() === seasonNumber);
          if (season) {
            const episode = season.episodes.find(e => e.episodio === episodeNumber);
            if (episode) {
              // Configurar URL através do proxy
              const token = localStorage.getItem('streamify_token');
              setVideoUrl(`${proxyBaseUrl}${encodeURIComponent(episode.url)}&token=${token}`);
              setTitle(`${content.title} - T${seasonNumber}E${episodeNumber}`);
            }
          }
        } else if (content.video_url) {
          // Se for filme
          const token = localStorage.getItem('streamify_token');
          setVideoUrl(`${proxyBaseUrl}${encodeURIComponent(content.video_url)}&token=${token}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        setLoadingError(true);
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, isAuthenticated, router, seasonParam, episodeParam]);

  // Configurar eventos de vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      
      // Se houver um tempo de reprodução salvo anteriormente, pular para ele
      const resumeFromPosition = localStorage.getItem(`watch_position_${id}`);
      if (resumeFromPosition) {
        const savedPosition = parseInt(resumeFromPosition, 10);
        // Só restaurar se o progresso for menor que 95% do vídeo
        if (savedPosition > 0 && savedPosition < (video.duration * 0.95)) {
          video.currentTime = savedPosition;
          toast({
            title: "Retomando de onde parou",
            duration: 3000
          });
        }
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // Marcar como assistido quando o vídeo terminar
      markAsWatched(id);
      localStorage.removeItem(`watch_position_${id}`);
    };
    
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [id, toast]);

  // Salvar progresso periodicamente
  useEffect(() => {
    if (!videoUrl || !isAuthenticated) return;
    
    const saveProgress = async () => {
      if (videoRef.current && videoRef.current.currentTime > 0) {
        // Salvar no localStorage para restaurar a posição se recarregar
        localStorage.setItem(`watch_position_${id}`, Math.floor(videoRef.current.currentTime).toString());
        
        // Salvar no backend
        await saveWatchProgress(
          id,
          Math.floor(videoRef.current.currentTime),
          seasonParam || undefined,
          episodeParam || undefined
        );
      }
    };
    
    // Salvar progresso a cada 30 segundos
    progressSaveIntervalRef.current = setInterval(saveProgress, 30000);
    
    // Salvar quando o componente for desmontado
    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
      saveProgress();
    };
  }, [id, videoUrl, isAuthenticated, seasonParam, episodeParam]);

  // Controle de exibição da interface
  useEffect(() => {
    const handleUserActivity = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);
    
    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Funções de controle do vídeo
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.currentTime + 15, video.duration);
  };
  
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(video.currentTime - 15, 0);
  };
  
  const handleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };
  
  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
      </div>
    );
  }

  if (loadingError || !videoUrl) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-xl font-semibold mb-4">Erro ao carregar o vídeo</h2>
        <p className="mb-6">Não foi possível carregar o conteúdo solicitado.</p>
        <button 
          onClick={handleClose}
          className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={videoContainerRef}
      className="fixed inset-0 bg-black"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={videoUrl}
        onClick={togglePlayPause}
        autoPlay
      />
      {showControls && (
        <>
          <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4">
            <button onClick={handleClose} className="bg-black/50 p-2 rounded-full">
              <X size={20} />
            </button>
            <div className="text-white font-medium text-center flex-1 truncate px-4">
              {title}
            </div>
            <div className="flex gap-2">
              <button className="bg-black/50 p-2 rounded-full">
                <Airplay size={20} />
              </button>
              <button className="bg-black/50 p-2 rounded-full">
                <Subtitles size={20} />
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-sm">-{formatTime(duration - currentTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={skipBackward} className="p-2">
                  <SkipBack size={24} />
                </button>
                <button onClick={togglePlayPause} className="p-2">
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <button onClick={skipForward} className="p-2">
                  <SkipForward size={24} />
                </button>
              </div>
              <button onClick={handleFullscreen} className="p-2">
                <Maximize size={24} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}