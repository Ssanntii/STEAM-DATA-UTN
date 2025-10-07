const apiConfig = {
  // API principal de Steam (requiere key para algunos endpoints)
  // En desarrollo usa el proxy, en producción la URL real
  baseURL: import.meta.env.DEV ? '/steam-api/' : import.meta.env.VITE_URL,
  
  // Store API (sin autenticación, mejor para detalles de juegos)
  storeURL: import.meta.env.DEV ? '/steam-store/api/' : 'https://store.steampowered.com/api/',
  
  // Community API (para imágenes y recursos públicos)
  communityURL: 'https://steamcommunity.com/',
  
  // Tu API key
  apiKey: import.meta.env.VITE_TOKEN,
  
  // Tu Steam ID (útil para endpoints de usuario)
  steamId: import.meta.env.VITE_STEAM_ID,
  
  timeout: 10000,
  
  // Helper para construir URLs de imágenes
  getAppImageURL: (appId, hash) => 
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
  
  getCapsuleImage: (appId) => 
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`,
  
  getLibraryImage: (appId) => 
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
}

export default apiConfig