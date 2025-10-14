import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import steamApi from '../api/steamApi';

const useGamesStore = create(
  persist(
    (set, get) => ({
      // State
      topGames: [],
      topSellers: [], // 👈 NUEVO
      featuredGames: [],
      offersGames: [],
      loading: false,
      error: null,
      lastFetch: null,
      lastFetchSellers: null, // 👈 NUEVO: cache separado para sellers
      progress: 0,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setProgress: (progress) => set({ progress }),

      // Fetch top games (más jugados)
      fetchTopGames: async (limit = 20, options = {}) => {
        const { topGames, lastFetch } = get();
        const { forceRefresh = false } = options;
        const now = Date.now();
        const CACHE_TIME = 5 * 60 * 1000;

        if (topGames.length > 0 && lastFetch && (now - lastFetch < CACHE_TIME) && !forceRefresh) {
          console.log('📦 Usando datos del cache de Zustand (Top Games)');
          return topGames;
        }

        try {
          set({ loading: true, error: null, progress: 0 });

          const games = await steamApi.getTopGamesWithDetails(limit, {
            forceRefresh,
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

      // 👇 NUEVO: Fetch top sellers (más vendidos)
      fetchTopSellers: async (limit = 150, options = {}) => {
        const { topSellers, lastFetchSellers } = get();
        const { forceRefresh = false } = options;
        const now = Date.now();
        const CACHE_TIME = 5 * 60 * 1000;

        if (topSellers.length > 0 && lastFetchSellers && (now - lastFetchSellers < CACHE_TIME) && !forceRefresh) {
          console.log('📦 Usando datos del cache de Zustand (Top Sellers)');
          return topSellers;
        }

        try {
          set({ loading: true, error: null, progress: 0 });

          // Usamos la API de Featured para obtener top sellers
          const response = await steamApi.getFeatured();
          let sellerIds = response.top_sellers?.items || [];
          
          // Limitar al número solicitado
          sellerIds = sellerIds.slice(0, limit);

          // Obtener detalles de cada juego
          const games = [];
          for (let i = 0; i < sellerIds.length; i++) {
            try {
              const game = await steamApi.getGameDetails(sellerIds[i].id);
              if (game) {
                games.push({
                  ...game,
                  rank: i + 1 // Agregar ranking
                });
              }
              
              // Actualizar progreso
              set({ progress: Math.round(((i + 1) / sellerIds.length) * 100) });
              
              // Pequeño delay para no saturar la API
              if (i < sellerIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (err) {
              console.error(`Error obteniendo juego ${sellerIds[i].id}:`, err);
            }
          }

          set({ 
            topSellers: games, 
            loading: false, 
            lastFetchSellers: now,
            progress: 100 
          });

          return games;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Fetch featured games (Top Sellers básico)
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
      clearCache: () => {
        steamApi.clearCache();
        set({ 
          topGames: [],
          topSellers: [], // 👈 NUEVO
          featuredGames: [],
          offersGames: [],
          lastFetch: null,
          lastFetchSellers: null // 👈 NUEVO
        });
      },

      // Refrescar datos
      refresh: async () => {
        const { fetchTopGames } = get();
        await fetchTopGames(20, { forceRefresh: true });
      },

      // 👇 NUEVO: Refrescar sellers
      refreshSellers: async () => {
        const { fetchTopSellers } = get();
        await fetchTopSellers(150, { forceRefresh: true });
      }
    }),
    {
      name: 'steam-games-storage',
      partialize: (state) => ({
        topGames: state.topGames,
        topSellers: state.topSellers, // 👈 NUEVO
        featuredGames: state.featuredGames,
        offersGames: state.offersGames,
        lastFetch: state.lastFetch,
        lastFetchSellers: state.lastFetchSellers, // 👈 NUEVO
      }),
    }
  )
);

export default useGamesStore;