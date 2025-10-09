import axiosClient, { storeClient } from "./axiosClient"
import apiConfig from "./apiConfig"

export const endpoints = {
  charts: 'ISteamChartsService',
  apps: 'ISteamApps',
  news: 'ISteamNews',
  user: 'ISteamUser',
  playerService: 'IPlayerService',
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

// ========== CACHE SIMPLE EN MEMORIA ==========
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

  // Detalles completos de un juego (con cache)
  getAppDetails: async (appId, params = {}) => {
    const cacheKey = `appDetails_${appId}`
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

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
      
      cache.set(cacheKey, gameData.data)
      return gameData.data
    } catch (error) {
      console.error(`Error obteniendo detalles del juego ${appId}:`, error)
      return null
    }
  },

  // ========== OPTIMIZADO: Carga paralela con límite de concurrencia ==========
  getMultipleGameDetails: async (appIds, options = {}) => {
    const {
      limit = 20,
      concurrency = 5, // Hacer 5 peticiones en paralelo
      delayBetweenBatches = 300, // Delay mínimo entre lotes
      onProgress = null,
      includePlayers = true // Incluir conteo de jugadores actuales
    } = options

    const total = Math.min(appIds.length, limit)
    const idsToFetch = appIds.slice(0, total)
    
    console.log(`🎮 Obteniendo detalles de ${total} juegos (${concurrency} en paralelo)...`)
    
    // Control de concurrencia
    const limiter = pLimit(concurrency)
    let completed = 0
    const games = []

    // Crear todas las promesas con límite de concurrencia
    const promises = idsToFetch.map((appId, index) => 
      limiter(async () => {
        try {
          // Obtener detalles y jugadores en paralelo
          const [details, playerCount] = await Promise.all([
            steamApi.getAppDetails(appId),
            includePlayers ? steamApi.getCurrentPlayers(appId) : Promise.resolve(0)
          ])
          
          if (!details) {
            console.warn(`⚠️ Juego ${appId} sin detalles`)
            return null
          }
          
          completed++
          const game = {
            appid: appId,
            name: details.name,
            short_description: details.short_description || '',
            header_image: details.header_image,
            capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`,
            background: details.background || details.background_raw,
            background_raw: details.background_raw,
            image: details.header_image,
            price: details.is_free ? 'Gratis' : details.price_overview?.final_formatted || 'N/A',
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
          }

          console.log(`✅ ${completed}/${total}: ${details.name} (${game.players} jugadores)`)

          // Callback de progreso
          if (onProgress) {
            onProgress({ current: completed, total, game })
          }

          // Pequeño delay cada ciertos juegos para no saturar
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

    // Esperar todas las promesas
    const results = await Promise.all(promises)
    
    // Filtrar nulls
    const validGames = results.filter(game => game !== null)
    
    console.log(`✨ Total de juegos obtenidos: ${validGames.length}/${total}`)
    return validGames
  },

  // ========== OPTIMIZADO: Top games con cache ==========
  getTopGamesWithDetails: async (limit = 20, options = {}) => {
    const cacheKey = `topGamesWithDetails_${limit}`
    
    // Si está en cache y no se fuerza refresh, devolver cache
    if (!options.forceRefresh && cache.has(cacheKey)) {
      console.log('📦 Usando top games desde cache')
      return cache.get(cacheKey)
    }

    try {
      // 1. Obtener ranking
      const topResponse = await steamApi.getTopPlayed()
      const ranks = topResponse?.response?.ranks || []
      
      if (ranks.length === 0) {
        throw new Error('No se obtuvieron juegos del ranking')
      }

      // 2. Extraer IDs
      const appIds = ranks.slice(0, limit).map(game => game.appid)
      
      // 3. Obtener detalles en paralelo (ahora incluye jugadores actuales)
      const gamesWithDetails = await steamApi.getMultipleGameDetails(appIds, {
        concurrency: 5,
        delayBetweenBatches: 200,
        includePlayers: true, // Incluir conteo real de jugadores
        ...options,
        limit,
      })

      // 4. Agregar info del ranking (peak, rank, etc)
      const enrichedGames = gamesWithDetails.map(game => {
        const rankInfo = ranks.find(r => r.appid === game.appid)
        return {
          ...game,
          rank: rankInfo?.rank || 0,
          // Usar current_players que ya viene de GetNumberOfCurrentPlayers
          concurrent_in_game: game.current_players,
          peak_in_game: rankInfo?.peak_in_game || 0,
          // players ya está formateado en getMultipleGameDetails
        }
      })

      // Guardar en cache
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

  // ========== USER/PLAYER ==========
  
  getOwnedGames: async (steamId = apiConfig.steamId, params = {}) => {
    try {
      const response = await axiosClient.get('IPlayerService/GetOwnedGames/v1/', {
        params: {
          steamid: steamId,
          include_appinfo: true,
          include_played_free_games: true,
          ...params
        }
      })
      return response
    } catch (error) {
      console.error('Error en getOwnedGames:', error)
      throw error
    }
  },

  getRecentlyPlayedGames: async (steamId = apiConfig.steamId, count = 10) => {
    try {
      const response = await axiosClient.get('IPlayerService/GetRecentlyPlayedGames/v1/', {
        params: {
          steamid: steamId,
          count
        }
      })
      return response
    } catch (error) {
      console.error('Error en getRecentlyPlayedGames:', error)
      throw error
    }
  },

  getPlayerSummaries: async (steamIds) => {
    try {
      const ids = Array.isArray(steamIds) ? steamIds.join(',') : steamIds
      const response = await axiosClient.get('ISteamUser/GetPlayerSummaries/v2/', {
        params: {
          steamids: ids
        }
      })
      return response
    } catch (error) {
      console.error('Error en getPlayerSummaries:', error)
      throw error
    }
  },

  // ========== STATS ==========
  
  // NUEVO: Obtener jugadores actuales de un juego específico
  getCurrentPlayers: async (appId) => {
    const cacheKey = `currentPlayers_${appId}`
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    try {
      const response = await axiosClient.get('ISteamUserStats/GetNumberOfCurrentPlayers/v1/', {
        params: {
          appid: appId
        }
      })
      
      const playerCount = response?.response?.player_count || 0
      
      console.log(`👥 Jugadores actuales de appid ${appId}:`, playerCount)
      
      cache.set(cacheKey, playerCount)
      return playerCount
    } catch (error) {
      console.error(`❌ Error obteniendo jugadores para appid ${appId}:`, error.message)
      // Retornar 0 en lugar de fallar
      return 0
    }
  },

  getPlayerAchievements: async (appId, steamId = apiConfig.steamId) => {
    try {
      const response = await axiosClient.get('ISteamUserStats/GetPlayerAchievements/v1/', {
        params: {
          appid: appId,
          steamid: steamId
        }
      })
      return response
    } catch (error) {
      console.error('Error en getPlayerAchievements:', error)
      throw error
    }
  },

  getGlobalAchievementPercentages: async (appId) => {
    try {
      const response = await axiosClient.get('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/', {
        params: {
          gameid: appId
        }
      })
      return response
    } catch (error) {
      console.error('Error en getGlobalAchievementPercentages:', error)
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

  // ========== UTILIDAD: Limpiar cache manualmente ==========
  clearCache: () => {
    cache.data.clear()
    cache.timestamps.clear()
    console.log('🗑️ Cache limpiado')
  }
}

export default steamApi