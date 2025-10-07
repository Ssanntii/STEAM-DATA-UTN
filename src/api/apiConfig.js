const apiConfig = {
  baseURL: import.meta.env.DEV ? '/steam-api/' : import.meta.env.VITE_URL,
  storeURL: import.meta.env.DEV ? '/steam-store/api/' : 'https://store.steampowered.com/api/',
  communityURL: 'https://steamcommunity.com/',
  
  // CAMBIAR esta línea:
  apiKey: import.meta.env.VITE_STEAM_API_KEY, // <- Cambiado de VITE_TOKEN
  steamId: import.meta.env.VITE_STEAM_ID,
  
  timeout: 10000,
  
  getAppImageURL: (appId) => 
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
  
  getCapsuleImage: (appId) => 
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`,
  
  getLibraryImage: (appId) => 
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
}

export default apiConfig