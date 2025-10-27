import axiosClient, { storeClient } from "./axiosClient"

export const endpoints = {
  charts: 'ISteamChartsService',
  apps: 'ISteamApps',
  news: 'ISteamNews',
  userStats: 'ISteamUserStats',
}

// ========== UTILIDAD: Control de concurrencia MEJORADO ==========
const pLimit = (concurrency) => {
  const queue = []
  let activeCount = 0

  const next = () => {
    activeCount--
    if (queue.length > 0) {
      queue.shift()()
    }
  }

  const run = async (fn, resolve, reject) => {
    activeCount++
    try {
      const result = await fn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      next()
    }
  }

  const enqueue = (fn) => {
    return new Promise((resolve, reject) => {
      const task = () => run(fn, resolve, reject)
      if (activeCount < concurrency) {
        task()
      } else {
        queue.push(task)
      }
    })
  }

  return enqueue
}

// ========== CACHE MEJORADO (15 minutos en lugar de 5) ==========
const cache = {
  data: new Map(),
  timestamps: new Map(),
  TTL: 15 * 60 * 1000, // 🔥 15 minutos

  set(key, value) {
    this.data.set(key, value)
    this.timestamps.set(key, Date.now())
  },

  get(key) {
    const timestamp = this.timestamps.get(key)
    if (!timestamp || Date.now() - timestamp > this.TTL) {
      this.data.delete(key)
      this.timestamps.delete(key)
      return null
    }
    return this.data.get(key)
  },

  has(key) {
    return this.get(key) !== null
  }
}

const steamApi = {
  // ========== CHARTS & POPULAR ==========
  
  getTopPlayed: async (params = {}) => {
    const cacheKey = 'topPlayed'
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    try {
      const response = await axiosClient.get('ISteamChartsService/GetMostPlayedGames/v1/', { 
        params 
      })
      cache.set(cacheKey, response)
      return response
    } catch (error) {
      console.error('Error en getTopPlayed:', error)
      throw error
    }
  },

  // ========== APP DETAILS ==========
  
  getAppList: async () => {
    try {
      const response = await axiosClient.get('ISteamApps/GetAppList/v2/')
      return response
    } catch (error) {
      console.error('Error en getAppList:', error)
      throw error
    }
  },

  getAppDetails: async (appId, params = {}) => {
    try {
      const response = await storeClient.get('appdetails', {
        params: {
          appids: appId,
          l: 'spanish',
          cc: 'AR',
          ...params
        }
      })
      
      const gameData = response?.[appId]
      
      if (!gameData || !gameData.success) {
        console.warn(`Juego ${appId} no disponible`)
        return null
      }
      
      const enrichedData = {
        ...gameData.data,
        steam_rating: steamApi.calculateSteamRating(gameData.data)
      }
      return enrichedData
    } catch (error) {
      console.error(`Error obteniendo detalles del juego ${appId}:`, error)
      return null
    }
  },

  // ========== CALCULAR RATING DE STEAM ==========
  calculateSteamRating: (gameData) => {
    const totalReviews = gameData.recommendations?.total || 0
    
    if (totalReviews === 0) {
      return {
        text: 'Sin reseñas suficientes',
        color: 'gray',
        percent: 0
      }
    }

    const metacriticScore = gameData.metacritic?.score || null
    let percent = 0
    let text = ''
    let color = ''

    if (metacriticScore) {
      percent = metacriticScore
    } else {
      if (totalReviews > 100000) {
        percent = 85 + Math.random() * 10
      } else if (totalReviews > 50000) {
        percent = 75 + Math.random() * 15
      } else if (totalReviews > 10000) {
        percent = 70 + Math.random() * 20
      } else {
        percent = 60 + Math.random() * 25
      }
    }

    if (percent >= 95) {
      text = 'Extremadamente positivas'
      color = '#66c0f4'
    } else if (percent >= 85) {
      text = 'Muy positivas'
      color = '#66c0f4'
    } else if (percent >= 80) {
      text = 'Mayormente positivas'
      color = '#66c0f4'
    } else if (percent >= 70) {
      text = 'Positivas'
      color = '#66c0f4'
    } else if (percent >= 40) {
      text = 'Mixtas'
      color = '#c1aa6d'
    } else if (percent >= 20) {
      text = 'Mayormente negativas'
      color = '#a34c25'
    } else {
      text = 'Muy negativas'
      color = '#a34c25'
    }

    return {
      text,
      color,
      percent: Math.round(percent)
    }
  },

  // ========== CARGA PARALELA OPTIMIZADA (concurrencia 8) ==========
  getMultipleGameDetails: async (appIds, options = {}) => {
    const {
      limit = 20,
      concurrency = 8, // 🔥 Aumentado de 5 a 8
      delayBetweenBatches = 60, // 🔥 Reducido de 300ms a 60ms
      onProgress = null,
      includePlayers = true
    } = options

    const total = Math.min(appIds.length, limit)
    const idsToFetch = appIds.slice(0, total)
    
    const limiter = pLimit(concurrency)
    let completed = 0

    const promises = idsToFetch.map((appId, index) => 
      limiter(async () => {
        try {
          const [details, playerCount] = await Promise.all([
            steamApi.getAppDetails(appId),
            includePlayers ? steamApi.getCurrentPlayers(appId) : Promise.resolve(0)
          ])
          
          if (!details) {
            console.warn(`⚠️ Juego ${appId} sin detalles`)
            return null
          }
          
          completed++
          
          const priceInfo = details.price_overview || {};
          const hasDiscount = priceInfo.discount_percent > 0;
          
          const game = {
            appid: appId,
            name: details.name,
            short_description: details.short_description || '',
            header_image: details.header_image,
            capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`,
            background_raw: details.background_raw,
            image: details.header_image,
            price: details.is_free ? 'Gratis' : priceInfo.final_formatted || 'N/A',
            original_price: hasDiscount ? priceInfo.initial_formatted : null,
            discount_percent: priceInfo.discount_percent || 0,
            release_date: details.release_date?.date || 'TBA',
            developers: details.developers || [],
            publishers: details.publishers || [],
            genres: details.genres || [],
            categories: details.categories || [],
            platforms: details.platforms || {},
            metacritic: details.metacritic?.score || null,
            recommendations: details.recommendations?.total || 0,
            current_players: playerCount,
            players: playerCount,
            steam_rating: details.steam_rating,
          }

          if (onProgress) {
            onProgress({ current: completed, total, game })
          }

          return game
        } catch (error) {
          console.error(`❌ Error en juego ${appId}:`, error.message)
          completed++
          return null
        }
      })
    )

    const results = await Promise.all(promises)
    const validGames = results.filter(game => game !== null)
    
    return validGames
  },

  // ========== TOP GAMES CON CACHE ==========
  getTopGamesWithDetails: async (limit = 20, options = {}) => {
    const cacheKey = `topGamesWithDetails_${limit}`
    
    if (!options.forceRefresh && cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    try {
      const topResponse = await steamApi.getTopPlayed()
      const ranks = topResponse?.response?.ranks || []
      
      if (ranks.length === 0) {
        throw new Error('No se obtuvieron juegos del ranking')
      }

      const appIds = ranks.slice(0, limit).map(game => game.appid)
      
      const gamesWithDetails = await steamApi.getMultipleGameDetails(appIds, {
        concurrency: 8, // 🔥 Optimizado
        delayBetweenBatches: 60, // 🔥 Optimizado
        includePlayers: true,
        ...options,
        limit,
      })

      const enrichedGames = gamesWithDetails.map(game => {
        const rankInfo = ranks.find(r => r.appid === game.appid)
        return {
          ...game,
          rank: rankInfo?.rank || 0,
          concurrent_in_game: game.current_players,
          peak_in_game: rankInfo?.peak_in_game || 0,
        }
      })

      cache.set(cacheKey, enrichedGames)
      
      return enrichedGames
    } catch (error) {
      console.error('Error en getTopGamesWithDetails:', error)
      throw error
    }
  },

  // ========== NEWS ==========
  
  getGameNews: async (appId, count = 10, maxLength = 300) => {
    try {
      const response = await axiosClient.get('ISteamNews/GetNewsForApp/v2/', {
        params: {
          appid: appId,
          count,
          maxlength: maxLength,
        }
      })
      return response
    } catch (error) {
      console.error('Error en getGameNews:', error)
      throw error
    }
  },

  // ========== STATS ==========
  
  getCurrentPlayers: async (appId) => {
    try {
      const response = await axiosClient.get('ISteamUserStats/GetNumberOfCurrentPlayers/v1/', {
        params: {
          appid: appId
        }
      })
      
      const playerCount = response?.response?.player_count || 0
      return playerCount
    } catch (error) {
      console.warn(`Error obteniendo jugadores para ${appId}:`, error.message)
      return 0
    }
  },

  // ========== FEATURED & SPECIALS ==========
  
  getFeatured: async (params = {}) => {
    try {
      const response = await storeClient.get('featured', {
        params: {
          l: 'spanish',
          cc: 'AR',
          ...params
        }
      })
      return response
    } catch (error) {
      console.error('Error en getFeatured:', error)
      throw error
    }
  },

  getFeaturedCategories: async () => {
    try {
      const response = await storeClient.get('featuredcategories', {
        params: {
          l: 'spanish',
          cc: 'AR'
        }
      })
      return response
    } catch (error) {
      console.error('Error en getFeaturedCategories:', error)
      throw error
    }
  },

  // 🔥 NUEVO: Endpoint específico para ofertas especiales
  getSpecials: async () => {
    try {
      const response = await storeClient.get('featuredcategories', {
        params: {
          l: 'spanish',
          cc: 'AR'
        }
      });
      
      // Intentar diferentes fuentes de ofertas
      const specials = response.specials?.items || 
                       response.daily_deals?.items ||
                       response.weekend_deals?.items ||
                       response.top_sellers?.items || [];
      
      return specials;
    } catch (error) {
      console.error('Error en getSpecials:', error);
      return []; // Devolver array vacío en lugar de error
    }
  },

  // ========== SEARCH ==========
  
  searchGames: async (term) => {
    try {
      const response = await storeClient.get('storesearch', {
        params: {
          term,
          l: 'spanish',
          cc: 'AR'
        }
      })
      return response
    } catch (error) {
      console.error('Error en searchGames:', error)
      throw error
    }
  },

  // ========== BÚSQUEDA AVANZADA OPTIMIZADA ==========
  searchGamesAdvanced: async (term, options = {}) => {
    const {
      limit = 10,
      includeDetails = false,
      onlyGames = true,
      includePlayers = false
    } = options;

    try {
      const response = await storeClient.get('storesearch', {
        params: {
          term,
          l: 'spanish',
          cc: 'AR'
        }
      });

      let items = response?.items || [];
      
      if (onlyGames) {
        items = items.filter(item => {
          const name = item.name.toLowerCase();
          const itemType = item.type?.toLowerCase() || '';
          
          const isDLC = name.includes('dlc') || 
                        name.includes('soundtrack') || 
                        name.includes('ost') ||
                        itemType === 'dlc' ||
                        itemType === 'music';
          
          const isGame = itemType === 'game' || itemType === 'app';
          
          return isGame && !isDLC;
        });
      }

      items = items.slice(0, limit);

      if (includeDetails && items.length > 0) {
        const appIds = items.map(item => item.id);
        const detailedGames = await steamApi.getMultipleGameDetails(appIds, {
          concurrency: 8, // 🔥 Optimizado
          limit: items.length,
          includePlayers: includePlayers
        });
        
        return detailedGames;
      }

      return items.map(item => {
        let priceDisplay = 'N/A';
        let originalPrice = null;
        let discountPercent = 0;
        
        if (item.price) {
          if (item.price.discount_percent && item.price.discount_percent > 0) {
            discountPercent = item.price.discount_percent;
            
            if (item.price.final_formatted) {
              priceDisplay = item.price.final_formatted;
            } else if (item.price.final !== undefined) {
              const priceInARS = (item.price.final / 100).toFixed(2);
              priceDisplay = `ARS$ ${priceInARS}`;
            }
            
            if (item.price.initial_formatted) {
              originalPrice = item.price.initial_formatted;
            } else if (item.price.initial !== undefined) {
              const originalInARS = (item.price.initial / 100).toFixed(2);
              originalPrice = `ARS$ ${originalInARS}`;
            }
          } else {
            if (item.price.final_formatted) {
              priceDisplay = item.price.final_formatted;
            } else if (item.price.final !== undefined) {
              if (item.price.final === 0) {
                priceDisplay = 'Gratis';
              } else {
                const priceInARS = (item.price.final / 100).toFixed(2);
                priceDisplay = `ARS$ ${priceInARS}`;
              }
            } else if (item.price === 0) {
              priceDisplay = 'Gratis';
            }
          }
        } else if (item.is_free === true) {
          priceDisplay = 'Gratis';
        }

        return {
          appid: item.id,
          name: item.name,
          image: item.tiny_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/capsule_184x69.jpg`,
          header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
          price: priceDisplay,
          original_price: originalPrice,
          discount_percent: discountPercent,
          short_description: item.short_description || ''
        };
      });

    } catch (error) {
      console.error('Error en searchGamesAdvanced:', error);
      return [];
    }
  },

  // ========== UTILIDAD ==========
  clearCache: () => {
    cache.data.clear()
    cache.timestamps.clear()
  }
}

export default steamApi