// lib/content-service.ts

const BASE_URL = "https://api.streamhivex.icu";

// Interface alinhada com os componentes existentes
export interface Content {
  id: string;
  title: string;
  poster_url: string;
  category?: string;
}

export interface APIContentItem {
  id: number;
  nome: string;
  poster: string;
  url: string;
  sinopse: string;
}

export interface ContinueWatchingItem {
  conteudo_id: number;
  tempo: number;
  temporada?: string;
  episodio?: string;
  nome: string;
  poster: string;
  url: string;
}

// Função para obter token do localStorage (deve ser chamada apenas no cliente)
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('streamify_token');
  }
  return null;
};


export const getLatest = async (): Promise<Content[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/content?categoria=LANÇAMENTOS&subcategoria=Filme`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      console.error(`Erro ao buscar conteúdos em alta: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.map((item: APIContentItem) => mapAPIToContent(item));
  } catch (error) {
    console.error("Erro ao buscar conteúdos em alta:", error);
    return [];
  }
  }
// Função auxiliar para converter dados da API para o formato dos componentes
const mapAPIToContent = (item: APIContentItem, category?: string): Content => {
  return {
    id: item.id.toString(),
    title: item.nome,
    poster_url: item.poster,
    category: category
  };
};

// Função para mapear itens de "continue assistindo" para o formato do componente
const mapWatchProgressToContent = (item: ContinueWatchingItem): Content => {
  return {
    id: item.conteudo_id.toString(),
    title: item.nome,
    poster_url: item.poster,
    category: item.temporada && item.episodio ? `T${item.temporada} E${item.episodio}` : undefined
  };
};

// Função para buscar conteúdos em alta (Lançamentos/Filme)
export async function getTrending(): Promise<Content[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/content?categoria=LANÇAMENTOS&subcategoria=Filme`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      console.error(`Erro ao buscar conteúdos em alta: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // A API retorna dados agrupados por categoria, vamos extrair os filmes
    if (data?.data?.LANÇAMENTOS?.Filme && Array.isArray(data.data.LANÇAMENTOS.Filme)) {
      return data.data.LANÇAMENTOS.Filme.map((item: APIContentItem) => 
        mapAPIToContent(item, "Lançamento")
      );
    }
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar conteúdos em alta:", error);
    return [];
  }
}

// Função para buscar o que o usuário estava assistindo
export async function getContinueWatching(): Promise<Content[]> {
  const token = getToken();
  
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}/api/continue-watching`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Erro ao buscar 'continue assistindo': ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map(mapWatchProgressToContent);
    }
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar 'continue assistindo':", error);
    return [];
  }
}

// Função para buscar recomendações para o usuário
export async function getRecommendations(): Promise<Content[]> {
  const token = getToken();
  
  if (!token) {
    return [];
  }

  try {
    // Presumindo que existe um endpoint para recomendações
    const response = await fetch(`${BASE_URL}/api/recommendations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Se não existir o endpoint ou houver outro erro, vamos buscar algum conteúdo alternativo
      return await getAlternativeRecommendations();
    }

    const data = await response.json();
    
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((item: APIContentItem) => 
        mapAPIToContent(item, "Recomendado")
      );
    }
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar recomendações:", error);
    // Fallback para conteúdo alternativo
    return await getAlternativeRecommendations();
  }
}

// Função alternativa para buscar recomendações (caso o endpoint não exista)
async function getAlternativeRecommendations(): Promise<Content[]> {
  try {
    // Vamos usar outra categoria como recomendação, por exemplo "POPULARES"
    const response = await fetch(`${BASE_URL}/api/content?categoria=POPULARES&subcategoria=Filme`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      console.error(`Erro ao buscar conteúdo alternativo: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Extrair filmes da primeira categoria disponível
    for (const category in data?.data) {
      if (data.data[category]?.Filme && Array.isArray(data.data[category].Filme)) {
        return data.data[category].Filme.map((item: APIContentItem) => 
          mapAPIToContent(item, "Popular")
        );
      }
    }
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar conteúdo alternativo:", error);
    return [];
  }
}

// Função para adicionar um conteúdo aos favoritos
export async function addToFavorites(contentId: string): Promise<boolean> {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ conteudo_id: parseInt(contentId) })
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao adicionar aos favoritos:", error);
    return false;
  }
}

// Função para adicionar um conteúdo à lista personalizada
export async function addToList(contentId: string): Promise<boolean> {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/lista`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ conteudo_id: parseInt(contentId) })
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao adicionar à lista:", error);
    return false;
  }
}

// Função para remover um conteúdo da lista personalizada
export async function removeFromList(contentId: string): Promise<boolean> {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/lista/${contentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao remover da lista:", error);
    return false;
  }
}