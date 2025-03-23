export default function ContentRowSkeleton() {
  return (
    <div className="px-4 py-2">
      <div className="flex overflow-x-auto hide-scrollbar gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-32">
            <div className="bg-zinc-800 rounded-lg w-full aspect-[2/3] animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

