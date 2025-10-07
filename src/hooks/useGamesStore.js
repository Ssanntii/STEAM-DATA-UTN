import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import steamApi from '../api/steamApi';

const useGamesStore = create(
  persist(
    (set, get) => ({
      // State
      topGames: [],
      featuredGames: [],
      dealsGames: [],
      gameDetailsCache: {}, // Cache de detalles de juegos individuales
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
        const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

        // Si ya hay datos y no han pasado 5 minutos, usar cache
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

      // Fetch deals (Ofertas)
      fetchDeals: async () => {
        try {
          set({ loading: true, error: null });
          const response = await steamApi.getFeatured();
          const games = response.specials?.items || [];
          
          set({ dealsGames: games, loading: false });
          return games;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Get o fetch game details con cache
      getGameDetails: async (appId, forceRefresh = false) => {
        const { gameDetailsCache } = get();

        // Verificar cache
        if (gameDetailsCache[appId] && !forceRefresh) {
          console.log(`📦 Usando detalles del cache para juego ${appId}`);
          return gameDetailsCache[appId];
        }

        try {
          set({ loading: true, error: null });
          const details = await steamApi.getAppDetails(appId);

          // Guardar en cache
          set((state) => ({
            gameDetailsCache: {
              ...state.gameDetailsCache,
              [appId]: details
            },
            loading: false
          }));

          return details;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Limpiar cache
      clearCache: () => set({ 
        topGames: [], 
        featuredGames: [],
        dealsGames: [],
        gameDetailsCache: {},
        lastFetch: null 
      }),

      // Refrescar datos
      refresh: async () => {
        const { fetchTopGames } = get();
        await fetchTopGames(20, true);
      }
    }),
    {
      name: 'steam-games-storage', // Nombre en localStorage
      partialize: (state) => ({
        topGames: state.topGames,
        featuredGames: state.featuredGames,
        dealsGames: state.dealsGames,
        gameDetailsCache: state.gameDetailsCache,
        lastFetch: state.lastFetch,
      }),
    }
  )
);

export default useGamesStore;