// lib/ranking-channel-service.ts
import { getToken } from "./content-service";

const BASE_URL = "https://api.streamhivex.icu";

// Função para buscar destaques para o HeroSlider da página inicial
export async function getHomeHighlights(): Promise<Array<{
  id: string;
  title: string;
  description: string;
  poster_url: string;
}>> {
  try {
    const response = await fetch(`${BASE_URL}/api/content?categoria=LANÇAMENTOS&subcategoria=Filme&limit=5`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      console.error(`Erro ao buscar destaques: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data?.data?.LANÇAMENTOS?.Filme && Array.isArray(data.data.LANÇAMENTOS.Filme)) {
      // Selecionar até 3 itens para o slider
      const selectedItems = data.data.LANÇAMENTOS.Filme.slice(0, 3);
      
      // Mapear para o formato do componente
      return Promise.all(selectedItems.map(async (item: any) => {
        let description = item.sinopse || "";
        
        // Se não tiver sinopse, tenta buscar
        if (!description && item.nome) {
          try {
            const sinopseResponse = await fetch(
              `${BASE_URL}/api/sinopse?nome=${encodeURIComponent(item.nome)}`,
              {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${getToken()}`
                }
              }
            );
            
            if (sinopseResponse.ok) {
              const sinopseData = await sinopseResponse.json();
              description = sinopseData.sinopse || "Assista agora este conteúdo exclusivo";
            }
          } catch (error) {
            console.error("Erro ao buscar sinopse:", error);
            description = "Assista agora este conteúdo exclusivo";
          }
        }
        
        return {
          id: item.id.toString(),
          title: item.nome,
          description,
          poster_url: item.poster
        };
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar destaques para Hero:", error);
    return [];
  }
}

// Interfaces de resposta da API
export interface APIRankingItem {
  posicao: number;
  id: number;
  nome: string;
  poster: string;
  url: string;
  sinopse: string;
}

export interface APIChannelContent {
  nome: string;
  poster: string;
  url: string;
  sinopse: string;
  episodios?: Array<{
    id: number;
    episodio: number | string;
    temporada: number | string;
    url: string;
    nome: string;
  }>;
}

// Interfaces para componentes
export interface RankingItem {
  id: string;
  title: string;
  poster_url: string;
  position: number;
}

export interface Channel {
  id: string;
  name: string;
  logo_url: string;
}

// Cache para armazenar os dados da API e evitar chamadas repetidas para cada canal
const channelContentCache: Record<string, {
  data: APIChannelContent[];
  timestamp: number;
}> = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para buscar o ranking de popularidade
export async function getPopularRanking(): Promise<RankingItem[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/ranking`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar ranking: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data?.ranking && Array.isArray(data.ranking)) {
      return data.ranking.map((item: APIRankingItem) => ({
        id: item.id.toString(),
        title: item.nome,
        poster_url: item.poster,
        position: item.posicao
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return [];
  }
}

// Lista de canais disponíveis
export function getAvailableChannels(): Channel[] {
  return [
    {
      id: "NETFLIX",
      name: "Netflix",
      logo_url: "/logos/netflix.png"
    },
    {
      id: "DISNEY",
      name: "Disney+",
      logo_url: "/logos/disney.png"
    },
    {
      id: "HBO",
      name: "HBO MAX",
      logo_url: "/logos/hbo.png"
    },
    {
      id: "APPLE",
      name: "Apple TV+",
      logo_url: "/logos/apple.png"
    },
    {
      id: "STAR",
      name: "Star+",
      logo_url: "/logos/star.jpg"
    },
    {
      id: "DISCOVERY",
      name: "Discovery+",
      logo_url: "/logos/discovery.png"
    },
    {
      id: "GLOBO",
      name: "Globoplay",
      logo_url: "/logos/globoplay.png"
    }
  ];
}

// Função auxiliar para buscar e cachear o conteúdo completo de um canal
async function fetchChannelContentData(channelId: string): Promise<APIChannelContent[]> {
  // Verificar cache primeiro
  const now = Date.now();
  if (
    channelContentCache[channelId] && 
    now - channelContentCache[channelId].timestamp < CACHE_DURATION
  ) {
    console.log(`Usando dados em cache para o canal ${channelId}`);
    return channelContentCache[channelId].data;
  }

  try {
    // Buscando todos os dados do canal sem paginação na API
    const response = await fetch(
      `${BASE_URL}/api/content?subcategoria=Serie&categoria=${channelId}`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }
      }
    );

    if (!response.ok) {
      console.error(`Erro ao buscar conteúdo do canal: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (data?.data && data.data[channelId]?.Serie && Array.isArray(data.data[channelId].Serie)) {
      // Armazenar em cache
      channelContentCache[channelId] = {
        data: data.data[channelId].Serie,
        timestamp: now
      };
      
      return data.data[channelId].Serie;
    }
    
    return [];
  } catch (error) {
    console.error(`Erro ao buscar conteúdo do canal ${channelId}:`, error);
    return [];
  }
}

// Função para buscar conteúdo de um canal específico com paginação no frontend
export async function getChannelContent(
  channelId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  contents: Array<{
    id: string;
    title: string;
    poster_url: string;
    category?: string;
    has_episodes: boolean;
  }>;
  hasMore: boolean;
  totalPages: number;
}> {
  try {
    // Buscar todos os dados do canal (sem paginação da API)
    const allChannelContent = await fetchChannelContentData(channelId);
    
    if (allChannelContent.length === 0) {
      return { contents: [], hasMore: false, totalPages: 0 };
    }
    
    // Implementar paginação no frontend
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedContent = allChannelContent.slice(startIndex, endIndex);
    
    // Calcular número total de páginas
    const totalPages = Math.ceil(allChannelContent.length / limit);
    
    // Verificar se há mais conteúdo
    const hasMore = page < totalPages;
    
    // Mapear os dados para o formato esperado pelo componente
    const contents = paginatedContent.map((item: APIChannelContent) => {
      // Verificar se o item tem episódios
      const hasEpisodes = Boolean(item.episodios && item.episodios.length > 0);
      
      // Usar o primeiro episódio para ID se existir, caso contrário, criar um ID baseado no nome da série
      const firstEpisode = hasEpisodes ? item.episodios![0] : null;
      const itemId = firstEpisode 
        ? firstEpisode.id.toString() 
        : `serie-${item.nome.replace(/\s+/g, '-').toLowerCase()}`;
      
      return {
        id: itemId,
        title: item.nome,
        // Usar o poster da série para todos os episódios (não o poster do episódio)
        poster_url: item.poster && item.poster.trim() !== "" 
          ? item.poster 
          : "/placeholder-poster.png",
        category: "Série",
        has_episodes: hasEpisodes
      };
    });
    
    return { 
      contents, 
      hasMore, 
      totalPages 
    };
  } catch (error) {
    console.error(`Erro ao buscar conteúdo do canal ${channelId}:`, error);
    return { contents: [], hasMore: false, totalPages: 0 };
  }
}

// Função para selecionar alguns itens aleatórios para o hero slider
export async function getChannelHighlights(channelId: string): Promise<Array<{
  id: string;
  title: string;
  description: string;
  poster_url: string;
}>> {
  try {
    // Buscar todos os dados do canal (sem paginação)
    const allChannelContent = await fetchChannelContentData(channelId);
    
    if (allChannelContent.length === 0) {
      console.log("Nenhum conteúdo encontrado para destaques do canal", channelId);
      return [];
    }
    
    // Selecionar até 3 itens aleatórios para o slider
    const shuffled = [...allChannelContent].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));
    
    // Buscar sinopses para os itens selecionados
    const highlights = await Promise.all(
      selected.map(async (item) => {
        let description = item.sinopse || "";
        
        // Tentar buscar sinopse na API se não tiver
        if (!description && item.nome) {
          try {
            const response = await fetch(
              `${BASE_URL}/api/sinopse?nome=${encodeURIComponent(item.nome)}`,
              {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${getToken()}`
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              description = data.sinopse || "Assista agora este conteúdo exclusivo";
            } else {
              description = "Assista agora este conteúdo exclusivo";
            }
          } catch (error) {
            console.error("Erro ao buscar sinopse:", error);
            description = "Assista agora este conteúdo exclusivo";
          }
        }
        
        // Criar ID baseado no primeiro episódio ou no nome da série
        const firstEpisode = item.episodios && item.episodios.length > 0 ? item.episodios[0] : null;
        const itemId = firstEpisode 
          ? firstEpisode.id.toString() 
          : `serie-${item.nome.replace(/\s+/g, '-').toLowerCase()}`;
        
        return {
          id: itemId,
          title: item.nome,
          description,
          poster_url: item.poster && item.poster.trim() !== "" 
            ? item.poster 
            : "/placeholder-poster.png"
        };
      })
    );
    
    console.log("Highlights processados:", highlights);
    return highlights;
  } catch (error) {
    console.error(`Erro ao buscar destaques do canal ${channelId}:`, error);
    return [];
  }
}