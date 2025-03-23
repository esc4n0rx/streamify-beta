export default function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-zinc-800 rounded-xl p-6 h-32 animate-pulse"></div>
      ))}
    </div>
  )
}

