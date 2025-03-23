"use client"

import { Suspense, useEffect, useState } from "react"
import Avatar from "@/components/Avatar"
import ContentRow from "@/components/ContentRow"
import { useAuth } from "@/components/AuthProvider"
import { 
  getTrending, 
  getContinueWatching, 
  getRecommendations,
  type Content
} from "@/lib/content-service"
import { Skeleton } from "@/components/ui/skeleton"

// Componente de carregamento para ContentRow
const ContentRowSkeleton = () => (
  <div className="px-4">
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="flex-shrink-0 w-32 h-48 rounded-lg" />
      ))}
    </div>
  </div>
)

export default function Home() {
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center p-4 pt-6">
        <h1 className="text-3xl font-bold">Assista Agora</h1>
        <Avatar />
      </div>

      <div className="px-4 py-2">
        <div className="inline-block bg-zinc-800 rounded-full px-4 py-1.5">
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-film"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 3v18" />
              <path d="M3 7.5h4" />
              <path d="M3 12h18" />
              <path d="M3 16.5h4" />
              <path d="M17 3v18" />
              <path d="M17 7.5h4" />
              <path d="M17 16.5h4" />
            </svg>
            Filmes
          </span>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold px-4 mb-3">Em Alta</h2>
        <Suspense fallback={<ContentRowSkeleton />}>
          <TrendingContent />
        </Suspense>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold px-4 mb-3">Continue Assistindo</h2>
        <Suspense fallback={<ContentRowSkeleton />}>
          <ContinueWatchingContent />
        </Suspense>
      </section>

      <section className="mt-8">
        <div className="flex justify-between items-center px-4 mb-3">
          <h2 className="text-2xl font-semibold">Recomendado para você</h2>
          <a href="#" className="text-blue-500">
            Ver Todos
          </a>
        </div>
        <Suspense fallback={<ContentRowSkeleton />}>
          <RecommendedContent />
        </Suspense>
      </section>
    </div>
  )
}

function TrendingContent() {
  const [trending, setTrending] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchTrending = async () => {
      if (isAuthenticated) {
        try {
          const data = await getTrending();
          setTrending(data);
        } catch (error) {
          console.error("Erro ao buscar conteúdos em alta:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [isAuthenticated]);

  if (loading) {
    return <ContentRowSkeleton />;
  }

  return <ContentRow contents={trending} aspectRatio="landscape" />;
}

function ContinueWatchingContent() {
  const [continueWatching, setContinueWatching] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (isAuthenticated) {
        try {
          const data = await getContinueWatching();
          setContinueWatching(data);
        } catch (error) {
          console.error("Erro ao buscar 'continue assistindo':", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchContinueWatching();
  }, [isAuthenticated]);

  if (loading) {
    return <ContentRowSkeleton />;
  }

  if (continueWatching.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-400">
        <p>Você ainda não assistiu nada. Comece agora!</p>
      </div>
    );
  }

  return <ContentRow contents={continueWatching} aspectRatio="landscape" />;
}

function RecommendedContent() {
  const [recommendations, setRecommendations] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (isAuthenticated) {
        try {
          const data = await getRecommendations();
          setRecommendations(data);
        } catch (error) {
          console.error("Erro ao buscar recomendações:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  if (loading) {
    return <ContentRowSkeleton />;
  }

  return <ContentRow contents={recommendations} aspectRatio="portrait" />;
}