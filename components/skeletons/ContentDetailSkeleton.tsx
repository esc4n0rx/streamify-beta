export default function ContentDetailSkeleton() {
  return (
    <>
      <div className="relative h-[70vh] bg-zinc-800 animate-pulse">
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <div className="h-10 w-10 bg-zinc-700 rounded-full"></div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-zinc-700 rounded-full"></div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <div className="h-10 bg-zinc-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="h-4 bg-zinc-700 rounded w-20"></div>
            <div className="h-4 bg-zinc-700 rounded w-20"></div>
            <div className="h-4 bg-zinc-700 rounded w-20"></div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row justify-center">
            <div className="h-12 bg-zinc-700 rounded w-full lg:w-44"></div>
            <div className="h-12 bg-zinc-700 rounded w-full lg:w-44"></div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-4 bg-zinc-800 rounded w-full mb-2"></div>
        <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>

        <div className="mt-6">
          <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4"></div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex border-b border-zinc-800 pb-4 mb-4">
              <div className="w-24 h-16 bg-zinc-800 rounded"></div>
              <div className="ml-3 flex-grow">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
              <div className="self-center ml-2 h-6 w-6 bg-zinc-800 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}