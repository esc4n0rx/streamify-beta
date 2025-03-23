import { create } from "zustand"
import { persist } from "zustand/middleware"
import { addToFavorites, removeFromFavorites } from "@/lib/api"

type Content = {
  id: string
  title: string
  poster_url: string
  category?: string
}

interface FavoritesState {
  favorites: string[] // Array de IDs dos conteúdos favoritos
  isFavorite: (id: string) => boolean
  toggleFavorite: (content: Content) => Promise<void>
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      isFavorite: (id: string) => {
        return get().favorites.includes(id)
      },

      toggleFavorite: async (content: Content) => {
        const { favorites, addFavorite, removeFavorite } = get()
        const isFavorite = favorites.includes(content.id)

        if (isFavorite) {
          await removeFromFavorites(content.id)
          removeFavorite(content.id)
        } else {
          await addToFavorites(content.id)
          addFavorite(content.id)
        }
      },

      addFavorite: (id: string) => {
        set((state) => ({
          favorites: state.favorites.includes(id) ? state.favorites : [...state.favorites, id],
        }))
      },

      removeFavorite: (id: string) => {
        set((state) => ({
          favorites: state.favorites.filter((favId) => favId !== id),
        }))
      },
    }),
    {
      name: "streamify-favorites",
    },
  ),
)

