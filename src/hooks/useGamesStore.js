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

      // Fetch top sellers (más vendidos) - VERSIÓN CORREGIDA
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

          console.log('🔍 Obteniendo featured games...');
          const response = await steamApi.getFeatured();
          
          console.log('📦 Respuesta de getFeatured:', response);
          
          // Verificar la estructura de los datos
          let sellerIds = [];
          
          if (response.featured_win) {
            sellerIds = response.featured_win;
          } else if (response.top_sellers?.items) {
            sellerIds = response.top_sellers.items;
          } else if (Array.isArray(response)) {
            sellerIds = response;
          }
          
          console.log('🎮 IDs encontrados:', sellerIds.length, sellerIds.slice(0, 3));
          
          if (sellerIds.length === 0) {
            throw new Error('No se encontraron juegos en la respuesta de Steam');
          }
          
          // Limitar al número solicitado
          sellerIds = sellerIds.slice(0, limit);

          // Obtener detalles de cada juego
          const games = [];
          for (let i = 0; i < sellerIds.length; i++) {
            try {
              // Manejar diferentes estructuras de datos
              const gameId = sellerIds[i].id || sellerIds[i].appid || sellerIds[i];
              
              console.log(`🔄 Obteniendo detalles del juego ${i + 1}/${sellerIds.length}: ${gameId}`);
              
              const gameDetails = await steamApi.getAppDetails(gameId);
              
              if (gameDetails) {
                // Adaptar la estructura de datos para que coincida con GameCard
                const game = {
                  appid: gameId,
                  name: gameDetails.name,
                  short_description: gameDetails.short_description || '',
                  header_image: gameDetails.header_image,
                  capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/capsule_616x353.jpg`,
                  background_raw: gameDetails.background_raw,
                  image: gameDetails.header_image,
                  price: gameDetails.is_free ? 'Gratis' : gameDetails.price_overview?.final_formatted || 'N/A',
                  release_date: gameDetails.release_date?.date || 'TBA',
                  developers: gameDetails.developers || [],
                  publishers: gameDetails.publishers || [],
                  genres: gameDetails.genres || [],
                  categories: gameDetails.categories || [],
                  platforms: gameDetails.platforms || {},
                  metacritic: gameDetails.metacritic?.score || null,
                  recommendations: gameDetails.recommendations?.total || 0,
                  steam_rating: gameDetails.steam_rating,
                  rank: i + 1,
                  concurrent_in_game: 0, // No tenemos este dato en featured
                };
                
                games.push(game);
              }
              
              // Actualizar progreso
              set({ progress: Math.round(((i + 1) / sellerIds.length) * 100) });
              
              // Pequeño delay para no saturar la API
              if (i < sellerIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (err) {
              console.error(`❌ Error obteniendo juego ${sellerIds[i].id || sellerIds[i]}:`, err);
            }
          }

          console.log(`✅ Total de juegos obtenidos: ${games.length}`);

          set({ 
            topSellers: games, 
            loading: false, 
            lastFetchSellers: now,
            progress: 100 
          });

          return games;
        } catch (error) {
          console.error('❌ Error en fetchTopSellers:', error);
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

      // Reemplaza la función fetchOffers en tu useGamesStore.js
      fetchOffers: async (limit = 150, options = {}) => {
        const { offersGames, lastFetch } = get();
        const { forceRefresh = false } = options;
        const now = Date.now();
        const CACHE_TIME = 5 * 60 * 1000;

        // Usar cache si está disponible
        if (offersGames.length > 0 && lastFetch && (now - lastFetch < CACHE_TIME) && !forceRefresh) {
          console.log('📦 Usando datos del cache de Zustand (Ofertas)');
          return offersGames;
        }

        try {
          set({ loading: true, error: null, progress: 0 });

          console.log('🔍 Obteniendo ofertas especiales...');
          const response = await steamApi.getFeatured();

          console.log('📦 Respuesta COMPLETA de getFeatured:', response);
          console.log('📦 Claves del objeto:', Object.keys(response));
          
          let offerIds = [];
          
          // ✅ SOLUCIÓN: Usar large_capsules que contiene juegos con descuentos
          if (response.large_capsules && Array.isArray(response.large_capsules)) {
            offerIds = response.large_capsules;
            console.log('✅ Usando large_capsules');
          } 
          // Fallback: intentar con featured_win
          else if (response.featured_win && Array.isArray(response.featured_win)) {
            offerIds = response.featured_win;
            console.log('✅ Usando featured_win');
          }
          // Último intento: cualquier array disponible
          else {
            const firstArrayKey = Object.keys(response).find(key => Array.isArray(response[key]));
            if (firstArrayKey) {
              offerIds = response[firstArrayKey];
              console.log(`✅ Usando ${firstArrayKey}`);
            }
          }
          
          console.log('🎮 Juegos encontrados:', offerIds.length);
          
          if (offerIds.length === 0) {
            throw new Error('No se encontraron juegos en la respuesta de Steam');
          }
          
          // Limitar al número solicitado
          offerIds = offerIds.slice(0, limit);

          // Obtener detalles de cada juego
          const games = [];
          for (let i = 0; i < offerIds.length; i++) {
            try {
              const gameId = offerIds[i].id || offerIds[i].appid || offerIds[i];
              
              console.log(`🔄 Obteniendo juego ${i + 1}/${offerIds.length}: ${gameId}`);
              
              const gameDetails = await steamApi.getAppDetails(gameId);
              
              if (gameDetails) {
                // Verificar si tiene descuento
                const discountPercent = gameDetails.price_overview?.discount_percent || 0;
                
                // Solo agregar juegos con descuento
                if (discountPercent > 0) {
                  const game = {
                    appid: gameId,
                    name: gameDetails.name,
                    short_description: gameDetails.short_description || '',
                    header_image: gameDetails.header_image,
                    capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/capsule_616x353.jpg`,
                    background_raw: gameDetails.background_raw,
                    image: gameDetails.header_image,
                    price: gameDetails.price_overview?.final_formatted || 'N/A',
                    original_price: gameDetails.price_overview?.initial_formatted || 'N/A',
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
                  
                  games.push(game);
                  console.log(`✅ Oferta agregada: ${gameDetails.name} (-${discountPercent}%)`);
                } else {
                  console.log(`⏭️ Juego sin descuento, omitiendo: ${gameDetails.name}`);
                }
              }
              
              // Actualizar progreso
              set({ progress: Math.round(((i + 1) / offerIds.length) * 100) });
              
              // Delay para no saturar la API
              if (i < offerIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (err) {
              console.error(`❌ Error obteniendo juego ${offerIds[i].id || offerIds[i]}:`, err);
            }
          }

          console.log(`✅ Total de ofertas obtenidas: ${games.length}`);

          // Si no se encontraron juegos con descuento, mostrar mensaje
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
            lastFetch: now,
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
      // Limpiar cache
      clearCache: () => {
        steamApi.clearCache();
        set({ 
          topGames: [],
          topSellers: [],
          featuredGames: [],
          offersGames: [],
          lastFetch: null,
          lastFetchSellers: null
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
      }),
    }
  )
);

export default useGamesStore;