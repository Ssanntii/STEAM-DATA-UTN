import axios from "axios"
import queryString from "query-string"
import apiConfig from "./apiConfig"

// Cliente para Steam Web API (endpoints que requieren key)
const axiosClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    // Steam usa 'key' como parámetro, no Bearer token
    const finalParams = {
      ...params,
      key: apiConfig.apiKey,
      format: 'json' // Steam soporta json, xml, vdf
    }
    return queryString.stringify(finalParams)
  }
})

// Cliente para Store API (sin autenticación)
const storeClient = axios.create({
  baseURL: apiConfig.storeURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  }
})

// Interceptor para Steam Web API
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data
    return response
  },
  (error) => {
    console.error('Steam API Error:', error.response?.data || error.message)
    throw error
  }
)

// Interceptor para Store API
storeClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data
    return response
  },
  (error) => {
    console.error('Steam Store API Error:', error.response?.data || error.message)
    throw error
  }
)

export { storeClient }
export default axiosClient