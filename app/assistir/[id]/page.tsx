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
  const [videoErrorDetails, setVideoErrorDetails] = useState<string | null>(null)
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const proxyBaseUrl = "https://api.streamhivex.icu/api/proxy?url="

  // Buscar detalhes do conteúdo
  useEffect(() => {
    const fetchContent = async () => {
      if (!isAuthenticated) {
        console.log("Usuário não autenticado, redirecionando para home");
        router.push('/');
        return;
      }
      
      console.log(`Iniciando busca de detalhes do conteúdo ID: ${id}`);
      try {
        const content = await getContentDetail(id);
        console.log("Resposta da API de detalhes:", content);
        
        if (!content) {
          console.error("Nenhum conteúdo encontrado");
          setLoadingError(true);
          return;
        }
        
        setTitle(content.title);
        console.log(`Título: ${content.title}, Tipo: ${content.type}`);
        
        // Se for uma série e tiver temporadas
        if (content.type === "series" && content.seasons && content.seasons.length > 0) {
          const seasonNumber = seasonParam || content.current_season?.toString() || "1";
          const episodeNumber = episodeParam || content.current_episode?.toString() || "1";
          
          console.log(`Buscando temporada ${seasonNumber}, episódio ${episodeNumber}`);
          
          // Encontrar a temporada e episódio corretos
          const season = content.seasons.find(s => s.number.toString() === seasonNumber);
          if (season) {
            console.log(`Temporada encontrada: ${season.title}, ${season.episodes.length} episódios`);
            const episode = season.episodes.find(e => e.episodio === episodeNumber);
            if (episode) {
              console.log(`Episódio encontrado: ${episode.episodio}, URL original: ${episode.url}`);
              
              // Configurar URL através do proxy
              const token = localStorage.getItem('streamify_token');
              const proxyUrl = `${proxyBaseUrl}${encodeURIComponent(episode.url)}`;
              const finalUrl = token ? `${proxyUrl}&token=${token}` : proxyUrl;
              
              console.log("URL proxy gerada:", finalUrl);
              setVideoUrl(finalUrl);
              setTitle(`${content.title} - T${seasonNumber}E${episodeNumber}`);
            } else {
              console.error(`Episódio ${episodeNumber} não encontrado na temporada ${seasonNumber}`);
              setLoadingError(true);
            }
          } else {
            console.error(`Temporada ${seasonNumber} não encontrada`);
            setLoadingError(true);
          }
        } else if (content.video_url) {
          // Se for filme
          console.log(`URL original do filme: ${content.video_url}`);
          const token = localStorage.getItem('streamify_token');
          const proxyUrl = `${proxyBaseUrl}${encodeURIComponent(content.video_url)}`;
          const finalUrl = token ? `${proxyUrl}&token=${token}` : proxyUrl;
          
          console.log("URL proxy gerada:", finalUrl);
          setVideoUrl(finalUrl);
        } else {
          console.error("Conteúdo não possui URL de vídeo");
          setLoadingError(true);
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
    
    const handleLoadStart = () => {
      console.log("Vídeo: Iniciando carregamento");
    };
    
    const handleCanPlay = () => {
      console.log("Vídeo: Pronto para reprodução");
    };
    
    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      console.error("Erro do vídeo:", target.error);
      
      if (target.error) {
        const errorMessage = `Erro no vídeo: ${target.error.code} - ${target.error.message}`;
        console.error(errorMessage);
        setVideoErrorDetails(errorMessage);
        
        // Verificar o tipo do erro
        switch (target.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            console.error("Carregamento do vídeo foi abortado");
            break;
          case 2: // MEDIA_ERR_NETWORK
            console.error("Erro de rede ao carregar o vídeo");
            break;
          case 3: // MEDIA_ERR_DECODE
            console.error("Erro ao decodificar o vídeo");
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            console.error("Formato de vídeo não suportado");
            break;
          default:
            console.error("Erro desconhecido");
        }
      }
      
      setLoadingError(true);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      console.log(`Vídeo: Metadados carregados. Duração: ${video.duration}s`);
      setDuration(video.duration);
      
      // Se houver um tempo de reprodução salvo anteriormente, pular para ele
      const resumeFromPosition = localStorage.getItem(`watch_position_${id}`);
      if (resumeFromPosition) {
        const savedPosition = parseInt(resumeFromPosition, 10);
        console.log(`Posição salva encontrada: ${savedPosition}s`);
        
        // Só restaurar se o progresso for menor que 95% do vídeo
        if (savedPosition > 0 && savedPosition < (video.duration * 0.95)) {
          console.log(`Pulando para ${savedPosition}s`);
          video.currentTime = savedPosition;
          toast({
            title: "Retomando de onde parou",
            duration: 3000
          });
        }
      }
    };
    
    const handlePlay = () => {
      console.log("Vídeo: Reprodução iniciada");
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log("Vídeo: Reprodução pausada");
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      console.log("Vídeo: Reprodução finalizada");
      setIsPlaying(false);
      // Marcar como assistido quando o vídeo terminar
      markAsWatched(id);
      localStorage.removeItem(`watch_position_${id}`);
    };
    
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    
    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
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
        console.log(`Progresso salvo localmente: ${Math.floor(videoRef.current.currentTime)}s`);
        
        // Salvar no backend
        try {
          await saveWatchProgress(
            id,
            Math.floor(videoRef.current.currentTime),
            seasonParam || undefined,
            episodeParam || undefined
          );
          console.log("Progresso salvo no servidor");
        } catch (error) {
          console.error("Erro ao salvar progresso:", error);
        }
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
      video.play().catch(error => {
        console.error("Erro ao iniciar reprodução:", error);
        toast({
          title: "Erro ao reproduzir vídeo",
          description: error.message,
          variant: "destructive"
        });
      });
    } else {
      video.pause();
    }
  };
  
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    setCurrentTime(value[0]);
    console.log(`Vídeo: Pulando para ${value[0]}s`);
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
    console.log(`Vídeo: Avançando para ${video.currentTime}s`);
  };
  
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(video.currentTime - 15, 0);
    console.log(`Vídeo: Retrocedendo para ${video.currentTime}s`);
  };
  
  const handleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
      console.log("Saindo do modo tela cheia");
    } else {
      container.requestFullscreen().catch(err => {
        console.error("Erro ao entrar em tela cheia:", err);
      });
      console.log("Entrando em modo tela cheia");
    }
  };
  
  const handleClose = () => {
    console.log("Fechando player");
    router.back();
  };

  const reloadVideo = () => {
    console.log("Tentando recarregar o vídeo");
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(error => {
        console.error("Erro ao reproduzir após recarregamento:", error);
      });
    }
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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-xl font-semibold mb-4">Erro ao carregar o vídeo</h2>
        <p className="mb-2">Não foi possível carregar o conteúdo solicitado.</p>
        
        {videoErrorDetails && (
          <div className="mb-4 p-3 bg-red-900/50 rounded max-w-lg text-sm">
            <p className="font-semibold mb-1">Detalhes do erro:</p>
            <p className="break-all">{videoErrorDetails}</p>
          </div>
        )}
        
        {videoUrl && (
          <div className="flex gap-4 mb-6">
            <button 
              onClick={reloadVideo}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
            <button 
              onClick={() => window.open(videoUrl, '_blank')}
              className="px-6 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
            >
              Abrir URL diretamente
            </button>
          </div>
        )}
        
        <button 
          onClick={handleClose}
          className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
        >
          Voltar
        </button>
        
        {videoUrl && (
          <div className="mt-6 text-xs text-gray-400 max-w-lg text-center">
            <p>URL gerada (pode ajudar na depuração):</p>
            <p className="truncate">{videoUrl}</p>
          </div>
        )}
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
        controls={false}
        crossOrigin="anonymous"
        playsInline
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