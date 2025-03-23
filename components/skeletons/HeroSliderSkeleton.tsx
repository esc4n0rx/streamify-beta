export default function HeroSliderSkeleton() {
  return (
    <div className="relative h-[50vh] bg-zinc-800 animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="h-8 bg-zinc-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-zinc-700 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-zinc-700 rounded w-32"></div>
      </div>
    </div>
  )
}

