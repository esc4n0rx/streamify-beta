"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import AuthModal from "@/components/AuthModal"
import { login as apiLogin, register as apiRegister} from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  nome: string
  email: string
  url_avatar: string
  criado_em: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("streamify_token")

      if (storedToken) {
        try {
          //const userData = await validateToken(storedToken)
          //setUser(userData.user)
          setToken(storedToken)
        } catch (error) {
          console.error("Erro ao validar token:", error)
          localStorage.removeItem("streamify_token")
          setShowAuthModal(true)
        }
      } else {
        setShowAuthModal(true)
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await apiLogin(email, password)

      localStorage.setItem("streamify_token", response.token)
      localStorage.setItem("user_id", response.user.id)
      localStorage.setItem("user_nome", response.user.nome)
      localStorage.setItem("user_email", response.user.email)
      
      if (response.user.url_avatar) {
        localStorage.setItem("user_avatar", response.user.url_avatar)
      }

      setUser(response.user)
      setToken(response.token)
      setShowAuthModal(false)
      console.log(response.token)
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo de volta, ${response.user.nome}!`,
      })
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      toast({
        title: "Erro ao fazer login",
        description: "Email ou senha incorretos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await apiRegister(name, email, password)

      // Armazenar token e dados do usuário
      localStorage.setItem("streamify_token", response.token)
      localStorage.setItem("user_id", response.data.id)
      localStorage.setItem("user_nome", response.data.nome)
      localStorage.setItem("user_email", response.data.email)
      
      if (response.data.url_avatar) {
        localStorage.setItem("user_avatar", response.data.url_avatar)
      }

      // Definir usuário com os dados retornados
      const userData: User = {
        id: response.data.id,
        nome: response.data.nome,
        email: response.data.email,
        url_avatar: response.data.url_avatar || "",
        criado_em: response.data.criado_em || new Date().toISOString()
      }

      setUser(userData)
      setToken(response.token)
      setShowAuthModal(false)

      toast({
        title: "Registro bem-sucedido",
        description: `Bem-vindo ao Streamify, ${response.data.nome}!`,
      })
    } catch (error) {
      console.error("Erro ao registrar:", error)
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível criar sua conta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    // Remover do localStorage
    localStorage.removeItem("streamify_token")
    localStorage.removeItem("user_id")
    localStorage.removeItem("user_nome")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_avatar")
    
    // Atualizar state
    setUser(null)
    setToken(null)
    setShowAuthModal(true)
    router.push("/")
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
      {showAuthModal && !isLoading && !user && <AuthModal isOpen={showAuthModal} onClose={() => {}} />}
    </AuthContext.Provider>
  )
}