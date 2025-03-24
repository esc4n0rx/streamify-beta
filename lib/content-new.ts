// lib/content-new.ts
import { getToken } from "./content-service";

const BASE_URL = "https://api.streamhivex.icu";
const ENDPOINT = `${BASE_URL}/api/content?categoria=LANÇAMENTOS&subcategoria=Filme`;

// Token JWT para desenvolvimento (utilize o token fornecido no paste.txt)
const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzdmMzc1LWExNGMtNDFiZC1iMzMyLWUwNDExODIxMjkzMiIsImVtYWlsIjoiYmFydEBnbWFpbC5jb20iLCJpYXQiOjE3NDI3ODQ4NjksImV4cCI6MTc0MzM4OTY2OX0.z3dMy-jjtsbDrglcMBY1lb225hQ2PJzSdnSUDd7ifsU";

// Função para obter token, com fallback para o token de desenvolvimento quando no servidor
const getAuthToken = (): string => {
  // Primeiro tenta obter o token do localStorage (cliente)
  const userToken = getToken();
  
  if (userToken) {
    return userToken;
  }
  
  // Se não encontrar no localStorage ou estiver no servidor, usa o token de desenvolvimento
  return DEV_TOKEN;
};

// Interfaces alinhadas com os componentes existentes
export interface ContentItem {
  id: string;
  title: string;
  poster_url: string;
  category?: string;
}

export interface HeroItem {
  id: string;
  title: string;
  description: string;
  poster_url: string;
}

export interface APIContentItem {
  id: number;
  nome: string;
  poster: string;
  url: string;
  sinopse: string;
  categoria?: string;
}

// Cache para armazenar os dados da API e evitar chamadas repetidas
let contentCache: APIContentItem[] | null = null;
let lastFetchTime = 0;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

// Função para mapear dados da API para o formato do componente ContentRow
const mapAPIToContent = (item: APIContentItem, category?: string): ContentItem => {
  return {
    id: item.id.toString(),
    title: item.nome,
    poster_url: item.poster,
    category: category || "Filme"
  };
};

// Função para mapear dados da API para o formato do componente HeroSlider
const mapAPIToHeroItem = (item: APIContentItem): HeroItem => {
  return {
    id: item.id.toString(),
    title: item.nome,
    description: item.sinopse || "Assista agora este conteúdo exclusivo",
    poster_url: item.poster
  };
};

// Função alternativa para tentar buscar conteúdo usando XMLHttpRequest
// Algumas configurações de CORS podem ser mais permissivas com XHR do que com fetch
async function tryFetchWithXHR(): Promise<APIContentItem[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      console.log("XHR não disponível no ambiente server-side");
      resolve([]);
      return;
    }
    
    console.log("Tentando requisição com XMLHttpRequest como alternativa");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", ENDPOINT);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    // Usar o token de autenticação (seja do cliente ou o de desenvolvimento)
    const token = getAuthToken();
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("XHR bem-sucedido com status:", xhr.status);
        try {
          const data = JSON.parse(xhr.responseText);
          if (data?.data?.LANÇAMENTOS?.Filme && Array.isArray(data.data.LANÇAMENTOS.Filme)) {
            console.log(`XHR encontrou ${data.data.LANÇAMENTOS.Filme.length} filmes`);
            resolve(data.data.LANÇAMENTOS.Filme);
          } else {
            console.log("XHR não encontrou a estrutura de dados esperada");
            resolve([]);
          }
        } catch (e) {
          console.error("Erro ao processar resposta XHR:", e);
          resolve([]);
        }
      } else {
        console.error("XHR falhou com status:", xhr.status);
        console.log("Resposta de erro XHR:", xhr.responseText);
        resolve([]);
      }
    };
    
    xhr.onerror = function() {
      console.error("Erro de rede na requisição XHR");
      resolve([]);
    };
    
    xhr.send();
  });
}

// Função para buscar e cachear todos os conteúdos
async function fetchAllContent(): Promise<APIContentItem[]> {
  const now = Date.now();
  
  // Verifica se tem cache válido
  if (contentCache && (now - lastFetchTime < CACHE_EXPIRY)) {
    console.log("Usando dados do cache, idade:", (now - lastFetchTime) / 1000, "segundos");
    return contentCache;
  }
  
  try {
    console.log("Iniciando requisição para:", ENDPOINT);
    
    // Usar o token de autenticação (seja do cliente ou o de desenvolvimento)
    const token = getAuthToken();
    console.log("Token disponível:", token ? "Sim" : "Não");
    
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    
    const response = await fetch(ENDPOINT, {
      method: "GET",
      headers
    });

    console.log("Status da resposta:", response.status);
    console.log("Status text:", response.statusText);
    console.log("Headers:", Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      // Tentar ler o corpo da resposta para mais detalhes sobre o erro
      try {
        const errorText = await response.text();
        console.error(`Erro ao buscar conteúdos: ${response.status} - ${response.statusText}`);
        console.error("Detalhes do erro:", errorText);
      } catch (e) {
        console.error(`Erro ao buscar conteúdos: ${response.status} - ${response.statusText}`);
      }
      return [];
    }

    const responseClone = response.clone();
    try {
      const data = await response.json();
      console.log("Resposta da API processada com sucesso");
      console.log("Estrutura da resposta:", JSON.stringify({
        has_data: !!data.data,
        has_lancamentos: !!data.data?.LANÇAMENTOS,
        has_filme: !!data.data?.LANÇAMENTOS?.Filme,
        content_length: data.data?.LANÇAMENTOS?.Filme?.length || 0
      }));
      
      if (data?.data?.LANÇAMENTOS?.Filme && Array.isArray(data.data.LANÇAMENTOS.Filme)) {
        // Atualiza o cache
        contentCache = data.data.LANÇAMENTOS.Filme;
        lastFetchTime = now;
        console.log(`Cache atualizado com ${contentCache?.length ?? 0} itens`);
        return contentCache ?? [];
      } else {
        console.warn("Resposta não contém a estrutura de dados esperada");
        return [];
      }
    } catch (jsonError) {
      console.error("Erro ao processar JSON da resposta:", jsonError);
      
      // Tentar ler o corpo como texto para diagnóstico
      try {
        const textContent = await responseClone.text();
        console.log("Conteúdo da resposta (primeiros 500 caracteres):", textContent.substring(0, 500));
      } catch (textError) {
        console.error("Erro ao ler resposta como texto:", textError);
      }
      
      return [];
    }
  } catch (error) {
    console.error("Erro ao buscar conteúdos:", error);
    if (error instanceof Error) {
      console.error("Detalhes do erro:", error.message, error.stack);
    }
    
    // Implementar fallback para testes quando a API falhar
    // Remova ou desative em produção quando a API estiver estável
    console.log("Usando dados mockados para depuração");
    return getMockData();
  }
}

// Dados mockados para teste e depuração
function getMockData(): APIContentItem[] {
  return [
    {
      id: 1001,
      nome: "Filme de Ação Teste",
      poster: "https://picsum.photos/seed/movie1/400/600",
      url: "#",
      sinopse: "Um filme de teste para depuração da interface quando a API falha."
    },
    {
      id: 1002,
      nome: "Aventura Fantástica",
      poster: "https://picsum.photos/seed/movie2/400/600",
      url: "#",
      sinopse: "Uma aventura incrível em um mundo de fantasia."
    },
    {
      id: 1003,
      nome: "Comédia Imperdível",
      poster: "https://picsum.photos/seed/movie3/400/600",
      url: "#",
      sinopse: "A comédia mais engraçada do ano."
    },
    {
      id: 1004,
      nome: "Drama Emocionante",
      poster: "https://picsum.photos/seed/movie4/400/600",
      url: "#",
      sinopse: "Uma história que vai tocar seu coração."
    },
    {
      id: 1005,
      nome: "Thriller de Suspense",
      poster: "https://picsum.photos/seed/movie5/400/600",
      url: "#",
      sinopse: "Um mistério que vai te deixar na ponta da cadeira."
    }
  ];
}

// Função para buscar os destaques para o HeroSlider (3 itens aleatórios)
export async function getHighlights(): Promise<HeroItem[]> {
  try {
    console.log("Buscando destaques para o carrossel");
    let allContent = await fetchAllContent();
    
    // Se o fetch falhou, tentar com XHR
    if (allContent.length === 0) {
      console.log("Tentando método alternativo para destaques");
      allContent = await tryFetchWithXHR();
    }
    
    // Se ainda não temos conteúdo, usar mock data em último caso
    if (allContent.length === 0) {
      console.log("Usando dados mockados para destaques");
      allContent = getMockData();
    }
    
    if (allContent.length === 0) {
      console.warn("Não foi possível obter destaques por nenhum método");
      return [];
    }
    
    // Selecionar aleatoriamente 3 itens para o carrossel
    const shuffled = [...allContent].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, 3);
    
    return selectedItems.map(mapAPIToHeroItem);
  } catch (error) {
    console.error("Erro ao buscar destaques:", error);
    return [];
  }
}

// Função para buscar os lançamentos mais recentes com paginação simulada
export async function getLatest(page = 1, limit = 10): Promise<{
  contents: ContentItem[], 
  hasMore: boolean
}> {
  try {
    console.log(`Buscando lançamentos: página ${page}, limite ${limit}`);
    let allContent = await fetchAllContent();
    
    // Se o fetch falhou, tentar com XHR
    if (allContent.length === 0) {
      console.log("Tentando método alternativo de requisição");
      allContent = await tryFetchWithXHR();
    }
    
    // Se ainda não temos conteúdo, usar mock data em último caso
    if (allContent.length === 0) {
      console.log("Usando dados mockados como último recurso");
      allContent = getMockData();
    }
    
    if (allContent.length === 0) {
      console.warn("Não foi possível obter conteúdo por nenhum método");
      return { contents: [], hasMore: false };
    }
    
    // Simulando paginação no cliente
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Ordenar por ID decrescente para mostrar os mais recentes primeiro
    const sortedContent = [...allContent].sort((a, b) => b.id - a.id);
    
    // Extrair a página atual
    const paginatedContent = sortedContent.slice(startIndex, endIndex);
    
    // Verificar se há mais conteúdo para carregar
    const hasMore = endIndex < sortedContent.length;
    
    return {
      contents: paginatedContent.map(item => mapAPIToContent(item)),
      hasMore
    };
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    return { contents: [], hasMore: false };
  }
}

// Função para buscar todos os conteúdos filtrados por categoria
export async function getContentByCategory(
  category: string, // Ignorado, sempre usando LANÇAMENTOS
  subcategory?: string, // Ignorado, sempre usando Filme
  page = 1,
  limit = 20
): Promise<{
  contents: ContentItem[],
  hasMore: boolean
}> {
  // Como só temos uma categoria/subcategoria, reaproveitamos a função getLatest
  return getLatest(page, limit);
}

// Função para buscar conteúdos por termo de pesquisa
export async function searchContent(term: string): Promise<ContentItem[]> {
  if (!term || term.trim().length < 2) {
    return [];
  }
  
  try {
    const allContent = await fetchAllContent();
    
    // Filtra os conteúdos que correspondem ao termo de busca no título ou sinopse
    const searchTerm = term.toLowerCase().trim();
    const filteredContent = allContent.filter(
      item => 
        item.nome.toLowerCase().includes(searchTerm) || 
        (item.sinopse && item.sinopse.toLowerCase().includes(searchTerm))
    );
    
    return filteredContent.map(item => mapAPIToContent(item));
  } catch (error) {
    console.error("Erro ao buscar por termo:", error);
    return [];
  }
}