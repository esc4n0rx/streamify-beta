import { Suspense } from "react"
import Link from "next/link"
import Avatar from "@/components/Avatar"
import ContentGrid from "@/components/ContentGrid"
import ContentGridSkeleton from "@/components/skeletons/ContentGridSkeleton"
import { getCategoryContents } from "@/lib/api"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center p-4 pt-6">
        <div className="flex items-center gap-2">
          <Link href="/categorias" className="text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold">{categoryName}</h1>
        </div>
        <Avatar />
      </div>

      <Suspense fallback={<ContentGridSkeleton />}>
        <CategoryContents slug={slug} />
      </Suspense>
    </div>
  )
}

async function CategoryContents({ slug }: { slug: string }) {
  const contents = await getCategoryContents(slug)
  // Garantir que contents seja um array
  return <ContentGrid contents={Array.isArray(contents) ? contents : []} />
}

