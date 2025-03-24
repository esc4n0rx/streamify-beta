"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Filter } from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"

type Category = {
  id: string
  name: string
}

type ContentFilterProps = {
  onFilterChange: (category: string, subcategory?: string) => void
  selectedCategory?: string
  selectedSubcategory?: string
}

// Categorias fictícias - em um ambiente real, viriam da API
const CATEGORIES: Category[] = [
  { id: "LANÇAMENTOS", name: "Lançamentos" },
  { id: "POPULARES", name: "Populares" },
  { id: "AÇÃO", name: "Ação" },
  { id: "COMÉDIA", name: "Comédia" },
  { id: "DRAMA", name: "Drama" },
  { id: "TERROR", name: "Terror" },
  { id: "ANIMAÇÃO", name: "Animação" }
]

// Subcategorias
const SUBCATEGORIES: Category[] = [
  { id: "Filme", name: "Filmes" },
  { id: "Serie", name: "Séries" },
  { id: "Anime", name: "Animes" },
  { id: "Dorama", name: "Doramas" }
]

export default function ContentFilter({ 
  onFilterChange, 
  selectedCategory = "LANÇAMENTOS",
  selectedSubcategory 
}: ContentFilterProps) {
  const [category, setCategory] = useState(selectedCategory)
  const [subcategory, setSubcategory] = useState(selectedSubcategory)

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
  }

  const handleSubcategoryChange = (newSubcategory?: string) => {
    setSubcategory(newSubcategory)
  }

  const applyFilters = () => {
    onFilterChange(category, subcategory)
  }

  const clearFilters = () => {
    setCategory("LANÇAMENTOS")
    setSubcategory(undefined)
    onFilterChange("LANÇAMENTOS")
  }

  return (
    <div className="w-full px-4 mb-4 flex items-center gap-2 overflow-x-auto hide-scrollbar py-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Filtrar Conteúdo</SheetTitle>
          </SheetHeader>
          
          <div className="py-4">
            <h3 className="text-sm font-medium mb-2">Categorias</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    category === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="py-4">
            <h3 className="text-sm font-medium mb-2">Tipo de Conteúdo</h3>
            <div className="space-y-2">
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  !subcategory ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => handleSubcategoryChange(undefined)}
              >
                Todos
              </button>
              
              {SUBCATEGORIES.map((subcat) => (
                <button
                  key={subcat.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    subcategory === subcat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => handleSubcategoryChange(subcat.id)}
                >
                  {subcat.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-4 flex gap-2">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Limpar
            </Button>
            <SheetClose asChild>
              <Button onClick={applyFilters} className="flex-1">
                Aplicar
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {SUBCATEGORIES.map((subcat) => (
          <Button
            key={subcat.id}
            variant={subcategory === subcat.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              handleSubcategoryChange(subcat.id === subcategory ? undefined : subcat.id)
              onFilterChange(category, subcat.id === subcategory ? undefined : subcat.id)
            }}
          >
            {subcat.name}
          </Button>
        ))}
      </div>
    </div>
  )
}