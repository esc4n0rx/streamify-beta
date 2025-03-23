"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

export default function QueryProvider({ children }: { children: ReactNode }) {
  // Cria uma nova instância do QueryClient para cada sessão do cliente
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

