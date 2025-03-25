// components/ChannelsRow.tsx
"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface Channel {
  id: string
  name: string
  logo_url: string
}

interface ChannelsRowProps {
  channels: Channel[]
}

export default function ChannelsRow({ channels }: ChannelsRowProps) {
  const router = useRouter()

  if (!channels || channels.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-400">
        <p>Nenhum canal disponível no momento.</p>
      </div>
    )
  }

  const handleClick = (channel: Channel) => {
    router.push(`/channel/${channel.id}`)
  }

  return (
    <div className="px-4">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleClick(channel)}
          >
            <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-zinc-800">
              <Image
                src={channel.logo_url}
                alt={channel.name}
                fill
                className="object-contain p-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder-logo.png"
                }}
              />
            </div>
            <div className="mt-2 w-24 text-center text-sm">{channel.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChannelsRowSkeleton() {
  return (
    <div className="px-4">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <Skeleton className="mt-2 w-16 h-4 mx-auto rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}