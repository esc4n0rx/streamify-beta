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
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleClick(channel)}
          >
            <div className="w-36 h-20 relative rounded-lg overflow-hidden">
              {/* Fundo escuro como fallback */}
              <div className="absolute inset-0 bg-zinc-900"></div>
              
              {/* Imagem de logo que preenche todo o card */}
              <Image
                src={channel.logo_url}
                alt={channel.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder-logo.png"
                }}
              />
              
              {/* Overlay gradiente para dar contraste ao texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              {/* Nome do canal sobreposto à imagem */}
              <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-white font-bold px-2 drop-shadow-md">
                {channel.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChannelsRowSkeleton() {
  return (
    <div className="px-4">
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="w-36 h-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}