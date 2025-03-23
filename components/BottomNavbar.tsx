"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Sparkles, Heart, Search } from "lucide-react"
import { motion } from "framer-motion"

export default function BottomNavbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { name: "Início", path: "/", icon: Home },
    { name: "Novidades", path: "/novidades", icon: Sparkles },
    { name: "Favoritos", path: "/favoritos", icon: Heart },
    { name: "Buscar", path: "/buscar", icon: Search },
  ]

  // Don't show navbar on video player page
  if (pathname.startsWith("/assistir")) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-zinc-800 z-50">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center w-full h-full relative"
            >
              <div className="flex flex-col items-center justify-center">
                <Icon size={20} className={active ? "text-white" : "text-gray-500"} />
                <span className={`text-xs mt-1 ${active ? "text-white" : "text-gray-500"}`}>{item.name}</span>
              </div>

              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 w-12 h-0.5 bg-white rounded-t-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

