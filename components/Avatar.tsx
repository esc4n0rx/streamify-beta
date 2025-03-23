"use client"

import { useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { Avatar as AvatarUI, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"

export default function Avatar() {
  const { user, logout } = useAuth()
  const [imageError, setImageError] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AvatarUI className="cursor-pointer border-2 border-white/20">
          {user && user.url_avatar && !imageError ? (
            <AvatarImage
              src={`${process.env.NEXT_PUBLIC_API_URL || ""}/${user.url_avatar}`}
              alt={user.nome}
              onError={() => setImageError(true)}
            />
          ) : (
            <AvatarFallback>{user ? getInitials(user.nome) : <User size={16} />}</AvatarFallback>
          )}
        </AvatarUI>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
        {user ? (
          <>
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <AvatarUI className="w-8 h-8">
                  {!imageError ? (
                    <AvatarImage src={`${process.env.NEXT_PUBLIC_API_URL || ""}/${user.url_avatar}`} alt={user.nome} />
                  ) : (
                    <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
                  )}
                </AvatarUI>
                <div>
                  <p className="font-medium">{user.nome}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Editar Conta</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Entrar</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

