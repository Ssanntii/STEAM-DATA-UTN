import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import steamApi from '../api/steamApi';

const useGamesStore = create(
  persist(
    (set, get) => ({
      // State
      topGames: [],
      topSellers: [],
      featuredGames: [],
      offersGames: [],
      loading: false,
      error: null,
      lastFetch: null,
      lastFetchSellers: null,
      lastFetchOffers: null,
      progress: 0,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setProgress: (progress) => set({ progress }),

      // ========== FETCH TOP GAMES (MÁS JUGADOS) ==========
      fetchTopGames: async (limit = 20, options = {}) => {
        const { topGames, lastFetch } = get();
        const { forceRefresh = false } = options;
        const now = Date.now();
        const CACHE_TIME = 15 * 60 * 1000;

        if (topGames.length > 0 && lastFetch && (now - lastFetch < CACHE_TIME) && !forceRefresh) {
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

      // ========== FETCH TOP SELLERS (MÁS VENDIDOS) ==========
      fetchTopSellers: async (limit = 150, options = {}) => {
        const { topSellers, lastFetchSellers } = get();
        const { forceRefresh = false } = options;
        const now = Date.now();
        const CACHE_TIME = 15 * 60 * 1000;

        if (topSellers.length > 0 && lastFetchSellers && (now - lastFetchSellers < CACHE_TIME) && !forceRefresh) {
          return topSellers;
        }

        try {
          set({ loading: true, error: null, progress: 0 });

          const response = await steamApi.getFeatured();
          
          let sellerIds = response.featured_win || response.top_sellers?.items || [];
          
          if (sellerIds.length === 0) {
            throw new Error('No se encontraron juegos en la respuesta de Steam');
          }
          
          sellerIds = sellerIds.slice(0, limit);

          const games = await steamApi.getMultipleGameDetails(sellerIds.map(item => item.id || item.appid || item), {
            concurrency: 8,
            limit: sellerIds.length,
            includePlayers: false,
            onProgress: ({ current, total }) => {
              set({ progress: Math.round((current / total) * 100) });
            }
          });

          const enrichedGames = games.map((game, index) => ({
            ...game,
            rank: index + 1
          }));

          set({ 
            topSellers: enrichedGames, 
            loading: false, 
            lastFetchSellers: now,
            progress: 100 
          });

          return enrichedGames;
        } catch (error) {
          console.error('❌ Error en fetchTopSellers:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ========== FETCH OFFERS (OFERTAS) - OPTIMIZADO ==========
      fetchOffers: async (limit = 150, options = {}) => {
        const { offersGames, lastFetchOffers } = get();
        const { forceRefresh = false } = options;
        const now = Date.now();
        const CACHE_TIME = 30 * 60 * 1000;

        if (offersGames.length > 0 && lastFetchOffers && (now - lastFetchOffers < CACHE_TIME) && !forceRefresh) {
          return offersGames;
        }

        try {
          set({ loading: true, error: null, progress: 0 });
          
          // PASO 1: Intentar con el endpoint de specials
          let offerIds = [];
          try {
            const specials = await steamApi.getSpecials();
            if (specials && specials.length > 0) {
              offerIds = specials.slice(0, 250);
            }
          } catch (err) {
            console.warn('⚠️ Specials no disponible');
          }
          
          // PASO 2: Complementar con featured si no hay suficientes
          if (offerIds.length < 200) {
            const featured = await steamApi.getFeatured();
            const featuredIds = featured.large_capsules || featured.featured_win || [];
            offerIds = [...offerIds, ...featuredIds];
            
            // Eliminar duplicados
            offerIds = [...new Map(offerIds.map(item => {
              const id = item.id || item.appid || item;
              return [id, item];
            })).values()];
            
            offerIds = offerIds.slice(0, 300);
          }
          
          if (offerIds.length === 0) {
            throw new Error('No se encontraron juegos para buscar ofertas');
          }
          
          // PASO 3: Procesar en lotes para encontrar ofertas
          const games = [];
          const BATCH_SIZE = 10;
          let processedCount = 0;
          
          for (let i = 0; i < offerIds.length && games.length < limit; i += BATCH_SIZE) {
            const batch = offerIds.slice(i, i + BATCH_SIZE);
            
            const batchPromises = batch.map(async (item) => {
              try {
                const gameId = item.id || item.appid || item;
                const gameDetails = await steamApi.getAppDetails(gameId);
                
                if (!gameDetails) return null;
                
                const priceInfo = gameDetails.price_overview || {};
                const discountPercent = priceInfo.discount_percent || 0;
                
                if (discountPercent > 0) {
                  return {
                    appid: gameId,
                    name: gameDetails.name,
                    short_description: gameDetails.short_description || '',
                    header_image: gameDetails.header_image,
                    capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/capsule_616x353.jpg`,
                    background_raw: gameDetails.background_raw,
                    image: gameDetails.header_image,
                    price: priceInfo.final_formatted || 'N/A',
                    original_price: priceInfo.initial_formatted || null,
                    discount_percent: discountPercent,
                    release_date: gameDetails.release_date?.date || 'TBA',
                    developers: gameDetails.developers || [],
                    publishers: gameDetails.publishers || [],
                    genres: gameDetails.genres || [],
                    categories: gameDetails.categories || [],
                    platforms: gameDetails.platforms || {},
                    metacritic: gameDetails.metacritic?.score || null,
                    recommendations: gameDetails.recommendations?.total || 0,
                    steam_rating: gameDetails.steam_rating,
                  };
                }
                
                return null;
              } catch (err) {
                console.error(`❌ Error procesando juego:`, err);
                return null;
              }
            });
            
            const batchResults = await Promise.all(batchPromises);
            const validGames = batchResults.filter(game => game !== null);
            games.push(...validGames);
            
            processedCount += batch.length;
            
            const progress = Math.min(
              Math.round((games.length / limit) * 100),
              Math.round((processedCount / offerIds.length) * 100)
            );
            set({ progress });
            
            if (games.length < limit && i + BATCH_SIZE < offerIds.length) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          if (games.length === 0) {
            set({ 
              offersGames: [], 
              loading: false, 
              error: 'No se encontraron ofertas activas en este momento',
              progress: 100 
            });
            return [];
          }

          set({ 
            offersGames: games, 
            loading: false, 
            lastFetchOffers: now,
            progress: 100,
            error: null
          });

          return games;
        } catch (error) {
          console.error('❌ Error en fetchOffers:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Fetch featured games (básico)
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

      // Limpiar cache
      clearCache: () => {
        steamApi.clearCache();
        set({ 
          topGames: [],
          topSellers: [],
          featuredGames: [],
          offersGames: [],
          lastFetch: null,
          lastFetchSellers: null,
          lastFetchOffers: null
        });
      },

      // Refrescar datos
      refresh: async () => {
        const { fetchTopGames } = get();
        await fetchTopGames(20, { forceRefresh: true });
      },

      // Refrescar sellers
      refreshSellers: async () => {
        const { fetchTopSellers } = get();
        await fetchTopSellers(150, { forceRefresh: true });
      },

      // 🔥 NUEVO: Refrescar ofertas
      refreshOffers: async () => {
        const { fetchOffers } = get();
        await fetchOffers(150, { forceRefresh: true });
      }
    }),
    {
      name: 'steam-games-storage',
      partialize: (state) => ({
        topGames: state.topGames,
        topSellers: state.topSellers,
        featuredGames: state.featuredGames,
        offersGames: state.offersGames,
        lastFetch: state.lastFetch,
        lastFetchSellers: state.lastFetchSellers,
        lastFetchOffers: state.lastFetchOffers // 🔥 Guardar también el cache de ofertas
      }),
    }
  )
);

export default useGamesStore;