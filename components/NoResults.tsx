import { FileSearch } from "lucide-react"
import { Button } from "@/components/ui/button"

type NoResultsProps = {
  message?: string
  resetFilters?: () => void
}

export default function NoResults({ 
  message = "Nenhum conteúdo encontrado", 
  resetFilters 
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <FileSearch className="h-16 w-16 mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Tente ajustar seus filtros ou buscar por outro termo
      </p>
      
      {resetFilters && (
        <Button onClick={resetFilters} variant="outline">
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}