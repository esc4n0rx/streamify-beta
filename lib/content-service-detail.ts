// lib/content-service-detail.ts
import { getToken } from "./content-service";

const BASE_URL = "https://api.streamhivex.icu";

export interface Episode {
  id: number;
  episodio: string;
  temporada: string;
  url: string;
  title?: string;
  thumbnail?: string;
  description?: string;
  duration?: number;
}

export interface Season {
  id: string;
  number: number;
  title: string;
  episodes: Episode[];
}

export interface ContentDetail {
  id: string;
  title: string;
  poster_url: string;
  category?: string;
  release_date?: string;
  duration?: number;
  description?: string;
  type: "movie" | "series";
  current_season?: number;
  current_episode?: number;
  seasons?: Season[];
  video_url?: string;
}

// Função para buscar os detalhes de um conteúdo específico
export async function getContentDetail(id: string): Promise<ContentDetail | null> {
  const token = getToken();
  
  if (!token) {
    return null;
  }

  try {
    // Buscar conteúdo diretamente pelo endpoint de search
    const searchResponse = await fetch(`${BASE_URL}/api/search?termo=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!searchResponse.ok) {
      console.error(`Erro ao buscar detalhes do conteúdo: ${searchResponse.status}`);
      return null;
    }

    const searchData = await searchResponse.json();
    console.log("Resposta da API:", JSON.stringify(searchData));
    
    // Verificar se a resposta tem os arrays de filmes e séries
    if (!searchData || (!searchData.filmes && !searchData.series)) {
      console.error("Formato de resposta inesperado da API");
      return null;
    }
    
    // Verificar se tem conteúdo em filmes ou séries
    let content = null;
    let contentType: "movie" | "series" = "movie";
    
    // Primeiro verifica nos filmes
    if (searchData.filmes && searchData.filmes.length > 0) {
      content = searchData.filmes[0]; // Pega o primeiro filme encontrado
      contentType = "movie";
    } 
    // Se não encontrou em filmes, verifica nas séries
    else if (searchData.series && searchData.series.length > 0) {
      content = searchData.series[0]; // Pega a primeira série encontrada
      contentType = "series";
    }
    
    if (!content) {
      console.error("Nenhum conteúdo encontrado para o ID:", id);
      return null;
    }

    // Obter sinopse, se não estiver presente
    let description = content.sinopse || "";
    if (!description && content.nome) {
      try {
        const sinopseResponse = await fetch(`${BASE_URL}/api/sinopse?nome=${encodeURIComponent(content.nome)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (sinopseResponse.ok) {
          const sinopseData = await sinopseResponse.json();
          description = sinopseData.sinopse || "";
        }
      } catch (error) {
        console.error("Erro ao buscar sinopse:", error);
      }
    }

    // Construir detalhes do conteúdo
    const result: ContentDetail = {
      id: id,
      title: content.nome || "Sem título",
      poster_url: content.poster || "",
      category: content.categoria || "Sem categoria",
      description: description,
      type: contentType,
      video_url: content.url || ""
    };

    // Se for série, adicionar informações de temporadas/episódios
    if (contentType === "series" && content.episodios && Array.isArray(content.episodios)) {
      // Agrupar episódios por temporada
      const episodesBySeasons = content.episodios.reduce((acc: {[key: string]: Episode[]}, episode: Episode) => {
        const seasonNumber = episode.temporada || "1";
        if (!acc[seasonNumber]) {
          acc[seasonNumber] = [];
        }
        acc[seasonNumber].push({
          ...episode,
          title: `Episódio ${episode.episodio}`,
          description: "", // Podemos tentar buscar descrição específica se necessário
          thumbnail: content.poster // Usar poster da série como fallback
        });
        return acc;
      }, {});

      // Converter para array de temporadas
      const seasons: Season[] = Object.keys(episodesBySeasons).map(seasonNumber => ({
        id: `season-${seasonNumber}`,
        number: parseInt(seasonNumber, 10),
        title: `Temporada ${seasonNumber}`,
        episodes: episodesBySeasons[seasonNumber]
      }));

      result.seasons = seasons;
      
      // Definir temporada/episódio atual (primeiro episódio da primeira temporada como padrão)
      if (seasons.length > 0 && seasons[0].episodes.length > 0) {
        result.current_season = seasons[0].number;
        result.current_episode = parseInt(seasons[0].episodes[0].episodio, 10);
      }

      // Verificar se há progresso de visualização
      try {
        const progressResponse = await fetch(`${BASE_URL}/api/watch/progresso`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          
          // Procurar progresso para este conteúdo
          if (progressData && progressData.data && Array.isArray(progressData.data)) {
            const progress = progressData.data.find(
              (item: any) => item.conteudo_id.toString() === id
            );
            
            if (progress && progress.temporada && progress.episodio) {
              result.current_season = parseInt(progress.temporada, 10);
              result.current_episode = parseInt(progress.episodio, 10);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar progresso:", error);
      }
    } else if (contentType === "movie") {
      // Para filmes, tentar obter duração (fictícia por enquanto, poderia vir da API)
      result.duration = 120; // Duração padrão em minutos
    }

    return result;
  } catch (error) {
    console.error("Erro ao buscar detalhes do conteúdo:", error);
    return null;
  }
}

// Função para registrar progresso de visualização
export async function saveWatchProgress(
  contentId: string,
  time: number,
  seasonNumber?: string,
  episodeNumber?: string
): Promise<boolean> {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  try {
    const payload: any = {
      conteudo_id: parseInt(contentId),
      tempo: time
    };

    // Adicionar temporada e episódio se fornecidos
    if (seasonNumber) {
      payload.temporada = seasonNumber;
    }
    
    if (episodeNumber) {
      payload.episodio = episodeNumber;
    }

    const response = await fetch(`${BASE_URL}/api/watch/progresso`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return false;
  }
}

// Função para registrar que um conteúdo foi assistido
export async function markAsWatched(contentId: string): Promise<boolean> {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/watch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ conteudo_id: parseInt(contentId) })
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao marcar como assistido:", error);
    return false;
  }
}