import Axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores'

const axios: AxiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_ENDPOINT,
})

axios.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (config.headers) {
    config.headers['Content-Type'] = 'application/json'
    config.headers['Authorization'] = 'Bearer ' + authStore.token
  }
  return config
})

export const api = axios
export default axios
