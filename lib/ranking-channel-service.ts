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
    console.log(response);
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

// Função para buscar conteúdo de um canal específico
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
    const response = await fetch(
      `${BASE_URL}/api/content?subcategoria=Serie&categoria=${channelId}&page=${page}&limit=${limit}`, 
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
      return { contents: [], hasMore: false, totalPages: 0 };
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (data?.data && data.data[channelId]?.Serie && Array.isArray(data.data[channelId].Serie)) {
      const contents = data.data[channelId].Serie.map((item: APIChannelContent) => {
        // Encontrar o primeiro episódio, se existir
        const firstEpisode = item.episodios && item.episodios.length > 0 ? item.episodios[0] : null;
        
        return {
          // Se tiver primeiro episódio, usa o ID dele, senão gera um ID único
          id: firstEpisode ? firstEpisode.id.toString() : `serie-${Math.random().toString(36).substring(2, 9)}`,
          title: item.nome,
          // Certifica-se de que a URL do poster é válida
          poster_url: item.poster && item.poster.startsWith("http") 
            ? item.poster 
            : "/placeholder-poster.png",
          category: "Série",
          has_episodes: Boolean(item.episodios && item.episodios.length > 0)
        };
      });
      
      const hasMore = page < (data.pagination?.pages || 1);
      const totalPages = data.pagination?.pages || 1;
      
      return { contents, hasMore, totalPages };
    }
    
    return { contents: [], hasMore: false, totalPages: 0 };
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
    // Buscar primeira página do conteúdo do canal
    const { contents } = await getChannelContent(channelId, 1, 10);
    
    if (contents.length === 0) {
      console.log("Nenhum conteúdo encontrado para destaques do canal", channelId);
      return [];
    }
    
    console.log("Conteúdos para slider:", contents);
    
    // Selecionar até 3 itens aleatórios para o slider
    const shuffled = [...contents].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));
    
    // Buscar sinopses para os itens selecionados
    const highlights = await Promise.all(
      selected.map(async (item) => {
        let description = "";
        
        // Tentar buscar sinopse na API
        try {
          const response = await fetch(
            `${BASE_URL}/api/sinopse?nome=${encodeURIComponent(item.title)}`,
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
        
        return {
          id: item.id,
          title: item.title,
          description,
          poster_url: item.poster_url.startsWith("http") 
            ? item.poster_url 
            : "/placeholder-poster.png" // Garantir que a URL é válida
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