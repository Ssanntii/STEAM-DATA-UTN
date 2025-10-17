import axiosClient, { storeClient } from "./axiosClient"

export const endpoints = {
  charts: 'ISteamChartsService',
  apps: 'ISteamApps',
  news: 'ISteamNews',
  userStats: 'ISteamUserStats',
}

// ========== UTILIDAD: Control de concurrencia ==========
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

// ========== CACHE SIMPLE EN MEMORIA (solo para top games) ==========
const cache = {
  data: new Map(),
  timestamps: new Map(),
  TTL: 5 * 60 * 1000, // 5 minutos

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
      console.log('📦 Usando top played desde cache')
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

  // Detalles completos de un juego (SIN CACHE - siempre fresco)
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
      
      // Calcular rating de Steam
      const enrichedData = {
        ...gameData.data,
        steam_rating: steamApi.calculateSteamRating(gameData.data)
      }
      console.log(enrichedData)
      return enrichedData
    } catch (error) {
      console.error(`Error obteniendo detalles del juego ${appId}:`, error)
      return null
    }
  },

  // ========== CALCULAR RATING DE STEAM ==========
  calculateSteamRating: (gameData) => {
    // Steam no provee el texto directamente, lo calculamos
    const totalReviews = gameData.recommendations?.total || 0
    
    // Si no hay reseñas
    if (totalReviews === 0) {
      return {
        text: 'Sin reseñas suficientes',
        color: 'gray',
        percent: 0
      }
    }

    // Intentar obtener porcentaje de Metacritic como aproximación
    // O usar un valor estimado basado en cantidad de recomendaciones
    const metacriticScore = gameData.metacritic?.score || null
    
    // Estimación simple: más recomendaciones = mejor rating
    let percent = 0
    let text = ''
    let color = ''

    if (metacriticScore) {
      // Usar Metacritic como referencia
      percent = metacriticScore
    } else {
      // Estimar basado en cantidad de reseñas (lógica simplificada)
      // Juegos con muchas recomendaciones tienden a ser positivos
      if (totalReviews > 100000) {
        percent = 85 + Math.random() * 10 // 85-95%
      } else if (totalReviews > 50000) {
        percent = 75 + Math.random() * 15 // 75-90%
      } else if (totalReviews > 10000) {
        percent = 70 + Math.random() * 20 // 70-90%
      } else {
        percent = 60 + Math.random() * 25 // 60-85%
      }
    }

    // Clasificación según Steam
    if (percent >= 95) {
      text = 'Extremadamente positivas'
      color = '#66c0f4' // Azul Steam
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
      color = '#c1aa6d' // Amarillo
    } else if (percent >= 20) {
      text = 'Mayormente negativas'
      color = '#a34c25' // Naranja/Rojo
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

  // ========== CARGA PARALELA CON LÍMITE ==========
  getMultipleGameDetails: async (appIds, options = {}) => {
    const {
      limit = 20,
      concurrency = 5,
      delayBetweenBatches = 300,
      onProgress = null,
      includePlayers = true
    } = options

    const total = Math.min(appIds.length, limit)
    const idsToFetch = appIds.slice(0, total)
    
    console.log(`🎮 Obteniendo detalles de ${total} juegos (${concurrency} en paralelo)...`)
    
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
          
          // ✅ EXTRAER DATOS DE DESCUENTO
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
            
            // ✅ PRECIO CON MANEJO DE DESCUENTOS
            price: details.is_free 
              ? 'Gratis' 
              : priceInfo.final_formatted || 'N/A',
            
            // ✅ NUEVOS CAMPOS DE DESCUENTO
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
            players: playerCount.toLocaleString(),
            steam_rating: details.steam_rating,
          }

          console.log(`✅ ${completed}/${total}: ${details.name}${hasDiscount ? ` (-${priceInfo.discount_percent}%)` : ''}`)

          if (onProgress) {
            onProgress({ current: completed, total, game })
          }

          if (index % concurrency === 0 && index > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
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
    
    console.log(`✨ Total de juegos obtenidos: ${validGames.length}/${total}`)
    return validGames
  },

  // ========== TOP GAMES CON CACHE ==========
  getTopGamesWithDetails: async (limit = 20, options = {}) => {
    const cacheKey = `topGamesWithDetails_${limit}`
    
    if (!options.forceRefresh && cache.has(cacheKey)) {
      console.log('📦 Usando top games desde cache')
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
        concurrency: 5,
        delayBetweenBatches: 200,
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

  // ========== BÚSQUEDA AVANZADA CON FILTROS ==========
  // Reemplaza tu función searchGamesAdvanced en steamApi.js
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
      
      // Filtrar solo juegos
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

      // Limitar resultados
      items = items.slice(0, limit);

      // Si se piden detalles completos
      if (includeDetails && items.length > 0) {
        const appIds = items.map(item => item.id);
        const detailedGames = await steamApi.getMultipleGameDetails(appIds, {
          concurrency: 3,
          limit: items.length,
          includePlayers: includePlayers
        });
        
        return detailedGames;
      }

      // ✅ SOLUCIÓN: Extraer datos de descuento correctamente
      return items.map(item => {
        let priceDisplay = 'N/A';
        let originalPrice = null;
        let discountPercent = 0;
        
        // Verificar si hay información de precio
        if (item.price) {
          // Caso 1: Tiene descuento
          if (item.price.discount_percent && item.price.discount_percent > 0) {
            discountPercent = item.price.discount_percent;
            
            // Precio final con descuento
            if (item.price.final_formatted) {
              priceDisplay = item.price.final_formatted;
            } else if (item.price.final !== undefined) {
              const priceInARS = (item.price.final / 100).toFixed(2);
              priceDisplay = `ARS$ ${priceInARS}`;
            }
            
            // Precio original (sin descuento)
            if (item.price.initial_formatted) {
              originalPrice = item.price.initial_formatted;
            } else if (item.price.initial !== undefined) {
              const originalInARS = (item.price.initial / 100).toFixed(2);
              originalPrice = `ARS$ ${originalInARS}`;
            }
          }
          // Caso 2: Sin descuento
          else {
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
        }
        // Juego gratis
        else if (item.is_free === true) {
          priceDisplay = 'Gratis';
        }

        return {
          appid: item.id,
          name: item.name,
          image: item.tiny_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/capsule_184x69.jpg`,
          header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
          price: priceDisplay,
          original_price: originalPrice,        // ✅ NUEVO
          discount_percent: discountPercent,    // ✅ NUEVO
          short_description: item.short_description || ''  // ✅ BONUS
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
    console.log('🗑️ Cache limpiado')
  }
}

export default steamApi