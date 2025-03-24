import axios from "axios"
import { create } from "zustand"

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.streamify.com"

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
})

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("streamify_token") : null

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Mock data for fallback
const mockData = {
  trending: [
    {
      id: "1",
      title: "Coast New Zealand",
      poster_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FlVSrnTDsSY8XSqoDGj3iyfNxC3LHB.png",
      category: "RECENTLY ADDED",
    },
    {
      id: "2",
      title: "The Reef",
      poster_url: "/placeholder.svg?height=400&width=600",
      category: "RECENTLY ADDED",
    },
    {
      id: "3",
      title: "Amazing Earth",
      poster_url: "/placeholder.svg?height=400&width=600",
      category: "DOCUMENTARY",
    },
  ],
  continueWatching: [
    {
      id: "4",
      title: "Black Lightning",
      poster_url: "/placeholder.svg?height=400&width=600",
      category: "CONTINUE WATCHING",
    },
  ],
  recommendations: [
    {
      id: "5",
      title: "Vegas",
      poster_url: "/placeholder.svg?height=600&width=400",
      category: "DRAMA",
    },
    {
      id: "6",
      title: "Our Planet",
      poster_url: "/placeholder.svg?height=600&width=400",
      category: "DOCUMENTARY",
    },
    {
      id: "7",
      title: "Black Lightning",
      poster_url: "/placeholder.svg?height=600&width=400",
      category: "KIDS & FAMILY",
    },
    {
      id: "8",
      title: "This Is Us",
      poster_url: "/placeholder.svg?height=600&width=400",
      category: "DRAMA SERIES",
    },
  ],
  highlights: [
    {
      id: "9",
      title: "Manifest",
      description: "Our first duty is each other.",
      poster_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZcrfLYSPoKykPJBwMegqJf3fWun8OZ.png",
    },
    {
      id: "10",
      title: "Amazing Earth",
      description: "Explore the wonders of our planet in stunning 4K.",
      poster_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Yd2LDjmHq57zJ5aQgSzekMql9pwdq4.png",
    },
    {
      id: "11",
      title: "Black Lightning",
      description: "A retired superhero becomes a vigilante for justice.",
      poster_url: "/placeholder.svg?height=600&width=1000",
    },
  ],
  latest: [
    {
      id: "12",
      title: "Black Lightning",
      poster_url: "/placeholder.svg?height=600&width=400",
      category: "KIDS & FAMILY",
    },
    {
      id: "13",
      title: "This Is Us",
      poster_url: "/placeholder.svg?height=600&width=400",
      category: "DRAMA SERIES",
    },
    {
      id: "14",
      title: "Manifest",
      poster_url: "/placeholder.svg?height=600&width=400",
      category: "DRAMA",
    },
  ],
  categories: [
    {
      id: "1",
      name: "Action",
      slug: "action",
      color: "red",
    },
    {
      id: "2",
      name: "Drama",
      slug: "drama",
      color: "blue",
    },
    {
      id: "3",
      name: "Kids & Family",
      slug: "kids-family",
      color: "purple",
    },
    {
      id: "4",
      name: "Horror",
      slug: "horror",
      color: "orange",
    },
    {
      id: "5",
      name: "Sci-Fi",
      slug: "sci-fi",
      color: "green",
    },
    {
      id: "6",
      name: "Thriller",
      slug: "thriller",
      color: "indigo",
    },
    {
      id: "7",
      name: "Comedy",
      slug: "comedy",
      color: "yellow",
    },
    {
      id: "8",
      name: "Oscars",
      slug: "oscars",
      color: "gold",
    },
  ],
  categoryContents: {
    action: [
      {
        id: "15",
        title: "Die Hard",
        poster_url: "/placeholder.svg?height=600&width=400",
        category: "ACTION",
      },
      {
        id: "16",
        title: "Mission Impossible",
        poster_url: "/placeholder.svg?height=600&width=400",
        category: "ACTION",
      },
    ],
    drama: [
      {
        id: "17",
        title: "This Is Us",
        poster_url: "/placeholder.svg?height=600&width=400",
        category: "DRAMA",
      },
      {
        id: "18",
        title: "Manifest",
        poster_url: "/placeholder.svg?height=600&width=400",
        category: "DRAMA",
      },
    ],
  },
  contentDetails: {
    "1": {
      id: "1",
      title: "Coast New Zealand",
      description:
        "Explore the stunning coastlines of New Zealand with host Neil Oliver as he discovers the rich history, incredible wildlife, and breathtaking landscapes of this island nation.",
      poster_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FlVSrnTDsSY8XSqoDGj3iyfNxC3LHB.png",
      category: "Documentary",
      release_date: "Jun 27, 2021",
      duration: 45,
      type: "series",
      current_season: 1,
      current_episode: 2,
      video_url: "/placeholder-video.mp4",
      seasons: [
        {
          id: "s1",
          season_number: 1,
          episodes: [
            {
              id: "e1",
              title: "North Island",
              episode_number: 1,
              duration: 45,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
            {
              id: "e2",
              title: "South Island",
              episode_number: 2,
              duration: 45,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
            },
          ],
        },
      ],
    },
    "9": {
      id: "9",
      title: "Manifest",
      description:
        "When Montego Air Flight 828 landed safely after a turbulent but routine flight, the crew and passengers were relieved. But in the span of those few hours, the world had aged five years.",
      poster_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZcrfLYSPoKykPJBwMegqJf3fWun8OZ.png",
      category: "Drama",
      release_date: "Sep 24, 2018",
      duration: 42,
      type: "series",
      current_season: 1,
      current_episode: 3,
      video_url: "/placeholder-video.mp4",
      seasons: [
        {
          id: "s1",
          season_number: 1,
          episodes: [
            {
              id: "e1",
              title: "Pilot",
              episode_number: 1,
              duration: 42,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
            {
              id: "e2",
              title: "Reentry",
              episode_number: 2,
              duration: 42,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
            {
              id: "e3",
              title: "Turbulence",
              episode_number: 3,
              duration: 42,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
            },
          ],
        },
        {
          id: "s2",
          season_number: 2,
          episodes: [
            {
              id: "e4",
              title: "Fasten Your Seatbelts",
              episode_number: 1,
              duration: 42,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
            },
            {
              id: "e5",
              title: "Grounded",
              episode_number: 2,
              duration: 42,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
            },
          ],
        },
      ],
    },
    "10": {
      id: "10",
      title: "Amazing Earth",
      description:
        "Narrated by Simon Smith, this documentary showcases nature's heroes from different places of Earth. Spotlighting amazing creatures and their habitats in stunning 4K resolution.",
      poster_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Yd2LDjmHq57zJ5aQgSzekMql9pwdq4.png",
      category: "Documentary",
      release_date: "Jun 27, 2021",
      duration: 30,
      type: "series",
      current_season: 2,
      current_episode: 1,
      video_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PhXTiNVzKFiIx6zGxABtaqZeYwTfZD.png",
      seasons: [
        {
          id: "s1",
          season_number: 1,
          episodes: [
            {
              id: "e1",
              title: "Lion Lands",
              episode_number: 1,
              duration: 29,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
            },
            {
              id: "e2",
              title: "Monkey Jungles",
              episode_number: 2,
              duration: 29,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
            },
            {
              id: "e4",
              title: "Bear Woods",
              episode_number: 4,
              duration: 27,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
            {
              id: "e5",
              title: "Bird Cities",
              episode_number: 5,
              duration: 27,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
            {
              id: "e6",
              title: "Cheetah Valleys",
              episode_number: 6,
              duration: 29,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
          ],
        },
        {
          id: "s2",
          season_number: 2,
          episodes: [
            {
              id: "e7",
              title: "Elephant Savannah",
              episode_number: 1,
              duration: 28,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
            {
              id: "e8",
              title: "Ram Mountains",
              episode_number: 2,
              duration: 28,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
            {
              id: "e9",
              title: "Kangaroo Plains",
              episode_number: 3,
              duration: 28,
              thumbnail_url: "/placeholder.svg?height=200&width=300",
              is_downloaded: true,
            },
          ],
        },
      ],
    },
  },
}

export async function login(email: string, password: string) {
  try {
    const response = await api.post("/api/auth/login", { email, senha: password })
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    return {
      status: 200,
      message: "Login bem-sucedido",
      token: "eyJhbGciOiJIUzI1...",
      user: {
        id: "123",
        nome: "Usuário Teste",
        email: email,
        criado_em: new Date().toISOString(),
        url_avatar: "assets/perfil/default.png",
      },
    }
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    const response = await api.post("/api/auth/register", {
      nome: name,
      email,
      senha: password,
    })
    return response.data
  } catch (error) {
    console.error("Register error:", error)
    return {
      status: 200,
      message: "Usuário registrado com sucesso",
      token: "eyJhbGciOiJIUzI1...",
      user: {
        id: "123",
        nome: name,
        email: email,
        criado_em: new Date().toISOString(),
        url_avatar: "assets/perfil/default.png",
      },
    }
  }
}


export async function getContinueWatching() {
  try {
    const response = await api.get("/api/continue")
    // Garantir que o retorno seja um array
    return Array.isArray(response.data) ? response.data : mockData.continueWatching
  } catch (error) {
    console.error("Error fetching continue watching:", error)
    return mockData.continueWatching
  }
}

export async function getRecommendations() {
  try {
    const response = await api.get("/api/recommendations")
    // Garantir que o retorno seja um array
    return Array.isArray(response.data) ? response.data : mockData.recommendations
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return mockData.recommendations
  }
}



// Modifique a função getCategories para garantir que sempre retorne um array
export async function getCategories() {
  try {
    const response = await api.get("/api/categories")
    // Garantir que o retorno seja um array
    return Array.isArray(response.data) ? response.data : mockData.categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return mockData.categories
  }
}

export async function getCategoryContents(slug: string) {
  try {
    const response = await api.get(`/api/categories/${slug}/contents`)
    return response.data
  } catch (error) {
    console.error(`Error fetching contents for category ${slug}:`, error)
    return mockData.categoryContents[slug as keyof typeof mockData.categoryContents] || []
  }
}

export async function searchContents(query: string) {
  try {
    const response = await api.get(`/api/search?q=${query}`)
    return response.data
  } catch (error) {
    console.error("Error searching contents:", error)
    // Filter mock data based on query
    const results = [...mockData.trending, ...mockData.recommendations, ...mockData.latest].filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(query.toLowerCase())),
    )
    return results
  }
}

export async function getContentDetail(id: string) {
  try {
    const response = await api.get(`/api/conteudo/${id}`)
    return response.data || null
  } catch (error) {
    console.error(`Error fetching content detail for ID ${id}:`, error)
    // Retornar o conteúdo mockado ou null se não existir
    return mockData.contentDetails[id as keyof typeof mockData.contentDetails] || null
  }
}

// Função para adicionar um conteúdo aos favoritos
export async function addToFavorites(contentId: string) {
  try {
    const response = await api.post("/api/favorites", { conteudo_id: contentId })
    return response.data
  } catch (error) {
    console.error("Error adding to favorites:", error)
    // Mock response
    return { success: true, message: "Adicionado aos favoritos" }
  }
}

// Função para remover um conteúdo dos favoritos
export async function removeFromFavorites(contentId: string) {
  try {
    const response = await api.delete(`/api/favorites/${contentId}`)
    return response.data
  } catch (error) {
    console.error("Error removing from favorites:", error)
    // Mock response
    return { success: true, message: "Removido dos favoritos" }
  }
}

// Função para obter a lista de favoritos do usuário
export async function getFavorites() {
  try {
    const response = await api.get("/api/favorites")
    // Garantir que o retorno seja um array
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error("Error fetching favorites:", error)
    // Mock data para desenvolvimento
    return [
      {
        id: "5",
        title: "Vegas",
        poster_url: "/placeholder.svg?height=600&width=400",
        category: "DRAMA",
      },
      {
        id: "10",
        title: "Amazing Earth",
        description: "Explore the wonders of our planet in stunning 4K.",
        poster_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Yd2LDjmHq57zJ5aQgSzekMql9pwdq4.png",
        category: "DOCUMENTARY",
      },
    ]
  }
}

// Auth store with Zustand
interface AuthState {
  user: any | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: any) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  logout: () => {
    localStorage.removeItem("streamify_token")
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

