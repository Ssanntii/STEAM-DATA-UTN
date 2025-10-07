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

const steamApi = {
  // ========== CHARTS & POPULAR ==========
  
  getTopPlayed: async (params = {}) => {
    try {
      const response = await axiosClient.get('ISteamChartsService/GetMostPlayedGames/v1/', { 
        params 
      })
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

  // Detalles completos de un juego
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
      
      console.log(`Detalles del juego ${appId}:`, response)
      
      // Steam devuelve un objeto con el appId como key
      const gameData = response?.[appId]
      
      if (!gameData) {
        throw new Error(`Sin respuesta para el juego ${appId}`)
      }
      
      if (!gameData.success) {
        console.warn(`Juego ${appId} no está disponible o es inválido`)
        return null
      }
      
      return gameData.data
    } catch (error) {
      console.error(`Error obteniendo detalles del juego ${appId}:`, error)
      return null // Retornar null en lugar de throw para que no rompa el loop
    }
  },

  // NUEVO: Obtener múltiples juegos con detalles
  getMultipleGameDetails: async (appIds, options = {}) => {
    const {
      limit = 20,
      delay = 1500, // Aumentado a 1.5s para evitar rate limiting
      onProgress = null
    } = options

    const games = []
    const total = Math.min(appIds.length, limit)
    
    console.log(`🎮 Obteniendo detalles de ${total} juegos...`)
    
    for (let i = 0; i < total; i++) {
      const appId = appIds[i]
      
      try {
        const details = await steamApi.getAppDetails(appId)
        
        if (!details) {
          console.warn(`⚠️ Juego ${appId} sin detalles, saltando...`)
          continue
        }
        
        games.push({
          appid: appId,
          name: details.name,
          short_description: details.short_description || '',
          header_image: details.header_image,
          capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`,
          background: details.background || details.background_raw,
          image: details.header_image, // Para compatibilidad con GameCard
          price: details.is_free ? 'Gratis' : details.price_overview?.final_formatted || 'N/A',
          release_date: details.release_date?.date || 'TBA',
          developers: details.developers || [],
          publishers: details.publishers || [],
          genres: details.genres || [],
          categories: details.categories || [],
          platforms: details.platforms || {},
          metacritic: details.metacritic?.score || null,
          recommendations: details.recommendations?.total || 0,
        })

        console.log(`✅ ${i + 1}/${total}: ${details.name}`)

        // Callback de progreso
        if (onProgress) {
          onProgress({ current: i + 1, total, game: games[games.length - 1] })
        }

        // Delay para evitar rate limiting
        if (i < total - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      } catch (error) {
        console.error(`❌ Error en juego ${appId}:`, error.message)
        continue
      }
    }
    
    console.log(`✨ Total de juegos obtenidos: ${games.length}/${total}`)
    return games
  },

  // NUEVO: Obtener top games con detalles completos
  getTopGamesWithDetails: async (limit = 20, options = {}) => {
    try {
      // 1. Obtener ranking de juegos más jugados
      const topResponse = await steamApi.getTopPlayed()
      const ranks = topResponse?.response?.ranks || []
      
      if (ranks.length === 0) {
        throw new Error('No se obtuvieron juegos del ranking')
      }

      // 2. Extraer los IDs
      const appIds = ranks.slice(0, limit).map(game => game.appid)
      
      // 3. Obtener detalles de cada juego
      const gamesWithDetails = await steamApi.getMultipleGameDetails(appIds, {
        ...options,
        limit,
      })

      // 4. Agregar información del ranking (INCLUYENDO JUGADORES)
      const enrichedGames = gamesWithDetails.map(game => {
        const rankInfo = ranks.find(r => r.appid === game.appid)
        return {
          ...game,
          rank: rankInfo?.rank || 0,
          concurrent_in_game: rankInfo?.concurrent_in_game || 0,
          peak_in_game: rankInfo?.peak_in_game || 0,
          players: rankInfo?.concurrent_in_game?.toLocaleString() || '0',
        }
      })

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
}

export default steamApi