export type User = {
  id: string
  nome: string
  email: string
  url_avatar: string
  criado_em: string
}

export type AuthResponse = {
  status: number
  message: string
  token: string
  user: User
}

export type Content = {
  id: string
  title: string
  description?: string
  poster_url: string
  category?: string
  release_date?: string
  duration?: number
  type?: "movie" | "series"
  current_season?: number
  current_episode?: number
  video_url?: string
  seasons?: Season[]
}

export type Season = {
  id: string
  season_number: number
  episodes: Episode[]
}

export type Episode = {
  id: string
  title: string
  episode_number: number
  duration: number
  thumbnail_url: string
  description?: string
  is_downloaded?: boolean
}

export type Category = {
  id: string
  name: string
  slug: string
  color: string
}

export type HeroItem = {
  id: string
  title: string
  description: string
  poster_url: string
}

