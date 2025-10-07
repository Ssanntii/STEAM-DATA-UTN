import axiosClient, { storeClient } from "./axiosClient"
import apiConfig from "./apiConfig"

// Categorías de endpoints
export const endpoints = {
  // Endpoints públicos (sin key requerida generalmente)
  charts: 'ISteamChartsService',
  apps: 'ISteamApps',
  news: 'ISteamNews',
  
  // Endpoints que requieren key
  user: 'ISteamUser',
  playerService: 'IPlayerService',
  userStats: 'ISteamUserStats',
}

const steamApi = {
  // ========== CHARTS & POPULAR ==========
  
  // Top juegos más jugados (público, no requiere key pero la podemos incluir)
  getTopPlayed: (params = {}) => {
    return axiosClient.get('ISteamChartsService/GetMostPlayedGames/v1/', { 
      params 
    })
  },

  // ========== APP DETAILS ==========
  
  // Lista completa de apps (público, NO requiere key)
  // ADVERTENCIA: Este endpoint devuelve +100k juegos, úsalo con cuidado
  getAppList: () => {
    return axiosClient.get('ISteamApps/GetAppList/v2/')
  },

  // Detalles de un juego específico (Store API - mejor opción)
  getAppDetails: (appId, params = {}) => {
    return storeClient.get('appdetails', {
      params: {
        appids: appId,
        l: 'spanish', // idioma
        cc: 'AR', // código de país para precios
        ...params
      }
    })
  },

  // ========== NEWS ==========
  
  // Noticias de un juego específico
  getGameNews: (appId, count = 10, maxLength = 300) => {
    return axiosClient.get('ISteamNews/GetNewsForApp/v2/', {
      params: {
        appid: appId,
        count,
        maxlength: maxLength,
      }
    })
  },

  // ========== USER/PLAYER (Requieren key) ==========
  
  // Juegos del usuario
  getOwnedGames: (steamId = apiConfig.steamId, params = {}) => {
    return axiosClient.get('IPlayerService/GetOwnedGames/v1/', {
      params: {
        steamid: steamId,
        include_appinfo: true,
        include_played_free_games: true,
        ...params
      }
    })
  },

  // Juegos jugados recientemente
  getRecentlyPlayedGames: (steamId = apiConfig.steamId, count = 10) => {
    return axiosClient.get('IPlayerService/GetRecentlyPlayedGames/v1/', {
      params: {
        steamid: steamId,
        count
      }
    })
  },

  // Resumen del perfil de usuario
  getPlayerSummaries: (steamIds) => {
    // Acepta un array o string de IDs separados por coma
    const ids = Array.isArray(steamIds) ? steamIds.join(',') : steamIds
    return axiosClient.get('ISteamUser/GetPlayerSummaries/v2/', {
      params: {
        steamids: ids
      }
    })
  },

  // ========== STATS ==========
  
  // Logros de un juego para un usuario
  getPlayerAchievements: (appId, steamId = apiConfig.steamId) => {
    return axiosClient.get('ISteamUserStats/GetPlayerAchievements/v1/', {
      params: {
        appid: appId,
        steamid: steamId
      }
    })
  },

  // Estadísticas globales de logros de un juego
  getGlobalAchievementPercentages: (appId) => {
    return axiosClient.get('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/', {
      params: {
        gameid: appId
      }
    })
  },

  // ========== SEARCH (usando Store API) ==========
  
  // Buscar juegos (limitado, considera usar tu backend para esto)
  searchGames: (term) => {
    // Este endpoint puede tener CORS issues
    return storeClient.get('storesearch', {
      params: {
        term,
        l: 'spanish',
        cc: 'AR'
      }
    })
  },

  // ========== FEATURED & SPECIALS ==========
  
  // Juegos destacados y ofertas
  getFeatured: (params = {}) => {
    return storeClient.get('featured', {
      params: {
        l: 'spanish',
        cc: 'AR',
        ...params
      }
    })
  },

  getFeaturedCategories: () => {
    return storeClient.get('featuredcategories', {
      params: {
        l: 'spanish',
        cc: 'AR'
      }
    })
  },
}

export default steamApi