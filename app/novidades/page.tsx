import { Suspense } from "react"
import Avatar from "@/components/Avatar"
import HeroSlider from "@/components/HeroSlider"
import InfiniteContentGrid from "@/components/InfiniteContentGrid"
import ContentGridSkeleton from "@/components/skeletons/ContentGridSkeleton"
import HeroSliderSkeleton from "@/components/skeletons/HeroSliderSkeleton"
import { getHighlights, getLatest } from "@/lib/content-new"

export default function Novidades() {
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center p-4 pt-6">
        <h1 className="text-3xl font-bold">Novidades</h1>
        <Avatar />
      </div>
      
      <Suspense fallback={<HeroSliderSkeleton />}>
        <HighlightsSlider />
      </Suspense>
      
      <section className="mt-8 mb-4">
        <h2 className="text-2xl font-semibold px-4 mb-3">Lançamentos Recentes</h2>
        <Suspense fallback={<ContentGridSkeleton />}>
          <LatestContent />
        </Suspense>
      </section>
    </div>
  )
}

async function HighlightsSlider() {
  const highlights = await getHighlights()
  // Garantir que highlights seja um array
  return <HeroSlider items={Array.isArray(highlights) ? highlights : []} />
}

async function LatestContent() {
  const { contents = [], hasMore = false } = await getLatest(1, 10) || {}
  
  // Log para debug
  console.log("Conteúdos para exibição:", contents.length, "hasMore:", hasMore);
  
  // Usar o componente InfiniteContentGrid com os conteúdos iniciais
  return <InfiniteContentGrid 
    initialContents={contents} 
    initialHasMore={hasMore} 
    aspectRatio="portrait" 
    itemsPerRow={5}
  />
}