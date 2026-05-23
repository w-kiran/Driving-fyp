import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = 'http://localhost:5000/api'

// MARK: - instance
const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// MARK: - interceptor for JWT
instance.interceptors.request.use(async (request) => {
  const token = localStorage.getItem('token')
  if (token && request.headers) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

// MARK: - response interceptor for 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// MARK: - getParsedUrl
const getParsedUrl = (url: string, params?: Record<string, string | number>): string => {
  if (!params) return url

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString() ? `${url}?${searchParams.toString()}` : url
}

// MARK: - api helper
const api = <T>(method: 'get' | 'delete' | 'post' | 'put' | 'patch') =>
  (
    url: string,
    params?: Record<string, string | number>,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    instance({
      url: getParsedUrl(url, params),
      method,
      data,
      ...config,
    })

export const apiGet = api<unknown>('get') as <T = unknown>(url: string, params?: Record<string, string | number>, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
export const apiPost = api<unknown>('post') as <T = unknown>(url: string, params?: Record<string, string | number>, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
export const apiPut = api<unknown>('put') as <T = unknown>(url: string, params?: Record<string, string | number>, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>
export const apiDelete = api<unknown>('delete') as <T = unknown>(url: string, params?: Record<string, string | number>, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>

export { instance }