import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

interface ApiResponse<T> {
  code: number;
  mag?: string;
  error_message?: string;
  data: T;
}

export class Service {
  private instance: AxiosInstance

  constructor (baseURL: string, timeout: number = 10000) {
    this.instance = axios.create({
      baseURL,
      timeout
    })

    this.initializeRequestInterceptor()
    this.initializeResponseInterceptor()
  }

  private initializeRequestInterceptor () {
    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleError.bind(this)
    )
  }

  private handleRequest (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    config.headers['Content-Type'] = 'application/json'
    return config
  }

  private initializeResponseInterceptor () {
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleError.bind(this)
    )
  }

  private handleResponse<T> (response: AxiosResponse<T>): T {
    const data = response.data as unknown as ApiResponse<T>
    if (data.code !== 0) {
      throw new Error('Request Error:' + data.code + ' ' + data.error_message)
    }

    return data as T
  }

  private handleError (error: AxiosError): Promise<never> {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }

  public async get<T> (url: string, params?: Record<string, unknown>, config?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.get<T>(url, { ...config, params })

    return response.data
  }

  public async post<T> (url: string, data?: Record<string, unknown>, config?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }
}
