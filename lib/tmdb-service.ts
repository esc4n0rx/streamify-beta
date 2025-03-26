// lib/tmdb-service.ts

// Constantes para a API TMDB
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

// Interfaces para os dados do TMDB
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: { id: number; name: string }[];
}

export interface TMDBSearchResult {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResult {
  results: TMDBVideo[];
}

export interface TMDBCredit {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  job?: string;
}

export interface TMDBCreditsResult {
  cast: TMDBCredit[];
  crew: TMDBCredit[];
}

// Função para buscar filme/série por título
export async function searchTMDBByTitle(title: string, isTV: boolean = false): Promise<TMDBMovie | null> {
  try {
    const contentType = isTV ? 'tv' : 'movie';
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/${contentType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=pt-BR`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`Erro na busca TMDB: ${searchResponse.status}`);
    }
    
    const searchData: TMDBSearchResult = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0) {
      return searchData.results[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar por título (${title}):`, error);
    return null;
  }
}

// Função para buscar detalhes de um filme pelo ID
export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar detalhes do filme: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar detalhes do filme (ID: ${movieId}):`, error);
    return null;
  }
}

// Função para buscar detalhes de uma série pelo ID
export async function getTVDetails(tvId: number): Promise<TMDBMovie | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar detalhes da série: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar detalhes da série (ID: ${tvId}):`, error);
    return null;
  }
}

// Função para buscar vídeos/trailers
export async function getVideos(id: number, isTV: boolean = false): Promise<TMDBVideo[]> {
  try {
    const contentType = isTV ? 'tv' : 'movie';
    const videosResponse = await fetch(
      `${TMDB_BASE_URL}/${contentType}/${id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    
    if (!videosResponse.ok) {
      throw new Error(`Erro ao buscar vídeos: ${videosResponse.status}`);
    }
    
    const videosData: TMDBVideosResult = await videosResponse.json();
    
    // Filtrar apenas trailers e teasers do YouTube
    let videos = videosData.results.filter(
      video => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")
    );
    
    // Se não encontrar vídeos em português, buscar em inglês
    if (videos.length === 0) {
      const enVideosResponse = await fetch(
        `${TMDB_BASE_URL}/${contentType}/${id}/videos?api_key=${TMDB_API_KEY}`
      );
      
      if (enVideosResponse.ok) {
        const enVideosData: TMDBVideosResult = await enVideosResponse.json();
        videos = enVideosData.results.filter(
          video => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")
        );
      }
    }
    
    // Dar preferência para trailers oficiais
    videos.sort((a, b) => {
      // Priorizar trailers sobre teasers
      if (a.type === "Trailer" && b.type === "Teaser") return -1;
      if (a.type === "Teaser" && b.type === "Trailer") return 1;
      
      // Entre dois trailers ou dois teasers, priorizar oficiais
      if (a.official && !b.official) return -1;
      if (!a.official && b.official) return 1;
      
      // Por último, ordenar por data de publicação (mais recente primeiro)
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
    
    return videos;
  } catch (error) {
    console.error(`Erro ao buscar vídeos (ID: ${id}):`, error);
    return [];
  }
}

// Função para buscar créditos (elenco e equipe)
export async function getCredits(id: number, isTV: boolean = false): Promise<TMDBCreditsResult | null> {
  try {
    const contentType = isTV ? 'tv' : 'movie';
    const response = await fetch(
      `${TMDB_BASE_URL}/${contentType}/${id}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar créditos: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar créditos (ID: ${id}):`, error);
    return null;
  }
}

// Função para buscar informações de classificação
export async function getContentRating(id: number, isTV: boolean = false): Promise<string> {
  try {
    if (isTV) {
      // Para séries, a classificação indicativa está no endpoint content_ratings
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${id}/content_ratings?api_key=${TMDB_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Procurar classificação do Brasil (BR) ou dos EUA (US)
        const brRating = data.results.find((r: any) => r.iso_3166_1 === "BR");
        if (brRating) return brRating.rating;
        
        const usRating = data.results.find((r: any) => r.iso_3166_1 === "US");
        if (usRating) return usRating.rating;
        
        // Se não encontrar BR ou US, retorna o primeiro disponível
        if (data.results.length > 0) return data.results[0].rating;
      }
    } else {
      // Para filmes, a classificação está no endpoint release_dates
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}/release_dates?api_key=${TMDB_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Procurar liberação no Brasil
        const brRelease = data.results.find((r: any) => r.iso_3166_1 === "BR");
        if (brRelease && brRelease.release_dates.length > 0) {
          return brRelease.release_dates[0].certification;
        }
        
        // Se não encontrar Brasil, procurar EUA
        const usRelease = data.results.find((r: any) => r.iso_3166_1 === "US");
        if (usRelease && usRelease.release_dates.length > 0) {
          return usRelease.release_dates[0].certification;
        }
      }
    }
    
    // Se não encontrar classificação, retornar vazio
    return "";
  } catch (error) {
    console.error(`Erro ao buscar classificação (ID: ${id}):`, error);
    return "";
  }
}

// Função principal para buscar todos os dados relevantes de um título
export async function getTMDBContentData(title: string, isTV: boolean = false) {
  try {
    // 1. Buscar ID pelo título
    const searchResult = await searchTMDBByTitle(title, isTV);
    
    if (!searchResult) {
      return null;
    }
    
    const id = searchResult.id;
    
    // 2. Buscar detalhes completos
    const details = isTV 
      ? await getTVDetails(id) 
      : await getMovieDetails(id);
    
    // 3. Buscar vídeos/trailers
    const videos = await getVideos(id, isTV);
    
    // 4. Buscar créditos (elenco e equipe)
    const credits = await getCredits(id, isTV);
    
    // 5. Buscar classificação indicativa
    const contentRating = await getContentRating(id, isTV);
    
    return {
      id,
      details,
      videos,
      credits,
      contentRating
    };
    
  } catch (error) {
    console.error(`Erro ao buscar dados completos para "${title}":`, error);
    return null;
  }
}