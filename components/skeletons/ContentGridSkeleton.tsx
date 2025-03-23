export default function ContentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-zinc-800 rounded-lg w-full aspect-[2/3] animate-pulse"></div>
      ))}
    </div>
  )
}

