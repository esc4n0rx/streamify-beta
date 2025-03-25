"use client"

import { Suspense, useEffect, useState } from "react"
import Avatar from "@/components/Avatar"
import ContentRow from "@/components/ContentRow"
import RankingRow, { RankingRowSkeleton } from "@/components/RankingRow"
import ChannelsRow, { ChannelsRowSkeleton } from "@/components/ChannelsRow"
import HeroSlider, { HeroSliderSkeleton } from "@/components/HeroSlider"
import { useAuth } from "@/components/AuthProvider"
import { 
  getTrending, 
  getContinueWatching, 
  getRecommendations,
  type Content
} from "@/lib/content-service"
import {
  getPopularRanking,
  getAvailableChannels,
  getHomeHighlights,
  type RankingItem,
  type Channel
} from "@/lib/ranking-channel-service"
import { Skeleton } from "@/components/ui/skeleton"

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
        <h1 className="text-3xl font-bold">Bem vindo</h1>
        <Avatar />
      </div>

      {/* <div className="px-4 py-2 mb-2">
        <div className="inline-block bg-zinc-800 rounded-full px-4 py-1.5">
          <span className="flex items-center gap-2">
          </span>
        </div>
      </div> */}
      
      <Suspense fallback={<HeroSliderSkeleton />}>
        <HomeHeroSlider />
      </Suspense>

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
          <h2 className="text-2xl font-semibold">Ranking do Streamify</h2>
          <a href="/ranking" className="text-blue-500">
            Ver Todos
          </a>
        </div>
        <Suspense fallback={<RankingRowSkeleton />}>
          <PopularRankingContent />
        </Suspense>
      </section>

      <section className="mt-8">
        <div className="flex justify-between items-center px-4 mb-3">
          <h2 className="text-2xl font-semibold">Canais & Apps</h2>
        </div>
        <Suspense fallback={<ChannelsRowSkeleton />}>
          <ChannelsContent />
        </Suspense>
      </section>

      <section className="mt-8">
        <div className="flex justify-between items-center px-4 mb-3">
          <h2 className="text-2xl font-semibold">Recomendado para você</h2>
          <a href="/recommendations" className="text-blue-500">
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

function PopularRankingContent() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRanking = async () => {
      if (isAuthenticated) {
        try {
          const data = await getPopularRanking();
          setRanking(data);
        } catch (error) {
          console.error("Erro ao buscar ranking de popularidade:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [isAuthenticated]);

  if (loading) {
    return <RankingRowSkeleton />;
  }

  return <RankingRow items={ranking} />;
}

function ChannelsContent() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Como a lista de canais é estática, não depende de autenticação
    const loadChannels = () => {
      try {
        const availableChannels = getAvailableChannels();
        setChannels(availableChannels);
      } catch (error) {
        console.error("Erro ao carregar canais:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChannels();
  }, []);

  if (loading) {
    return <ChannelsRowSkeleton />;
  }

  return <ChannelsRow channels={channels} />;
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

function HomeHeroSlider() {
  const [highlights, setHighlights] = useState<Array<{
    id: string;
    title: string;
    description: string;
    poster_url: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchHighlights = async () => {
      if (isAuthenticated) {
        try {
          const data = await getHomeHighlights();
          setHighlights(data);
        } catch (error) {
          console.error("Erro ao buscar destaques:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, [isAuthenticated]);

  if (loading) {
    return <HeroSliderSkeleton />;
  }

  if (highlights.length === 0) {
    return null;
  }

  return <HeroSlider items={highlights} />;
}