"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Avatar from "@/components/Avatar"
import CategoryGrid from "@/components/CategoryGrid"
import ContentGrid from "@/components/ContentGrid"
import CategoryGridSkeleton from "@/components/skeletons/CategoryGridSkeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mic, SearchIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { searchContents, getCategories } from "@/lib/api"

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  // Garantir que categoriesData seja um array
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  const { data: searchResultsData = [], isLoading } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: () => searchContents(searchTerm),
    enabled: searchTerm.length > 2,
  })

  // Garantir que searchResultsData seja um array
  const searchResults = Array.isArray(searchResultsData) ? searchResultsData : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim().length > 2) {
      router.push(`/buscar?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center p-4 pt-6">
        <h1 className="text-3xl font-bold">Buscar</h1>
        <Avatar />
      </div>

      <form onSubmit={handleSearch} className="px-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Buscar filmes, séries..."
            className="pl-10 pr-10 py-6 bg-zinc-800 border-none rounded-xl text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <Mic size={20} />
          </Button>
        </div>
      </form>

      {searchTerm.length > 2 ? (
        <>
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-400">Buscando...</p>
            </div>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <ContentGrid contents={searchResults} />
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-400">Nenhum resultado encontrado para "{searchTerm}"</p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="px-4">
          <h2 className="text-xl font-semibold mb-4">Categorias</h2>
          {isCategoriesLoading ? <CategoryGridSkeleton /> : <CategoryGrid categories={categories} />}
        </div>
      )}
    </div>
  )
}

