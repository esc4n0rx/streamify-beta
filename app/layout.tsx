import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import BottomNavbar from "@/components/BottomNavbar"
import AuthProvider from "@/components/AuthProvider"
import QueryProvider from "@/components/providers/QueryProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Streamify",
  description: "Your premium streaming service",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Streamify",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <main className="min-h-screen pb-16">{children}</main>
              <BottomNavbar />
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'