import { Suspense } from "react"
import Avatar from "@/components/Avatar"
import CategoryGrid from "@/components/CategoryGrid"
import CategoryGridSkeleton from "@/components/skeletons/CategoryGridSkeleton"
import { getCategories } from "@/lib/api"

export default function Categorias() {
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center p-4 pt-6">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <Avatar />
      </div>

      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  )
}

async function CategoriesContent() {
  const categories = await getCategories()
  // Garantir que categories seja um array
  return <CategoryGrid categories={Array.isArray(categories) ? categories : []} />
}

