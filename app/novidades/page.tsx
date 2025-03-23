import { Suspense } from "react"
import Avatar from "@/components/Avatar"
import HeroSlider from "@/components/HeroSlider"
import ContentRow from "@/components/ContentRow"
import ContentRowSkeleton from "@/components/skeletons/ContentRowSkeleton"
import HeroSliderSkeleton from "@/components/skeletons/HeroSliderSkeleton"
import { getHighlights, getLatest } from "@/lib/api"

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

      <section className="mt-8">
        <h2 className="text-2xl font-semibold px-4 mb-3">Lançamentos Recentes</h2>
        <Suspense fallback={<ContentRowSkeleton />}>
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
  const latest = await getLatest()
  // Garantir que latest seja um array
  return <ContentRow contents={Array.isArray(latest) ? latest : []} aspectRatio="portrait" />
}

