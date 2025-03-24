export default function ContentGridSkeleton() {
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="bg-zinc-800 rounded-lg w-full aspect-[2/3] animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}