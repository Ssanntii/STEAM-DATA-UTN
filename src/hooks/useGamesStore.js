import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import steamApi from '../api/steamApi';

const useGamesStore = create(
  persist(
    (set, get) => ({
      // State (sin gameDetailsCache)
      topGames: [],
      featuredGames: [],
      offersGames: [],
      loading: false,
      error: null,
      lastFetch: null,
      progress: 0,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setProgress: (progress) => set({ progress }),

      // Fetch top games (con cache de 5 minutos)
      fetchTopGames: async (limit = 20, forceRefresh = false) => {
        const { topGames, lastFetch } = get();
        const now = Date.now();
        const CACHE_TIME = 5 * 60 * 1000;

        if (topGames.length > 0 && lastFetch && (now - lastFetch < CACHE_TIME) && !forceRefresh) {
          console.log('📦 Usando datos del cache');
          return topGames;
        }

        try {
          set({ loading: true, error: null, progress: 0 });

          const games = await steamApi.getTopGamesWithDetails(limit, {
            onProgress: ({ current, total }) => {
              set({ progress: Math.round((current / total) * 100) });
            }
          });

          set({ 
            topGames: games, 
            loading: false, 
            lastFetch: now,
            progress: 100 
          });

          return games;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Fetch featured games (Top Sellers)
      fetchFeaturedGames: async () => {
        try {
          set({ loading: true, error: null });
          const response = await steamApi.getFeatured();
          const games = response.top_sellers?.items || [];
          
          set({ featuredGames: games, loading: false });
          return games;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Fetch offers (Ofertas)
      fetchOffers: async () => {
        try {
          set({ loading: true, error: null });
          const response = await steamApi.getFeatured();
          const games = response.specials?.items || [];
          
          set({ offersGames: games, loading: false });
          return games;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Limpiar cache
      clearCache: () => set({ 
        topGames: [], 
        featuredGames: [],
        offersGames: [],
        lastFetch: null 
      }),

      // Refrescar datos
      refresh: async () => {
        const { fetchTopGames } = get();
        await fetchTopGames(20, true);
      }
    }),
    {
      name: 'steam-games-storage',
      partialize: (state) => ({
        topGames: state.topGames,
        featuredGames: state.featuredGames,
        offersGames: state.offersGames,
        lastFetch: state.lastFetch,
      }),
    }
  )
);

export default useGamesStore;