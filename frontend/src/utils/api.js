import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

// Root-level client (for /health connectivity check)
const rootClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
})

// API client (for all /api/* dataset endpoints)
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000, // 30 seconds for larger file parsing
})

// Configure retry interceptor for transient errors
apiClient.interceptors.response.use(undefined, async (err) => {
  const { config } = err
  // Retry only GET requests with retry config
  if (!config || !config.retry || config.method !== 'get') {
    return Promise.reject(err)
  }
  
  config.__retryCount = config.__retryCount || 0
  if (config.__retryCount >= config.retry) {
    return Promise.reject(err)
  }
  
  config.__retryCount += 1
  const delay = config.retryDelay || 1000
  await new Promise((resolve) => setTimeout(resolve, delay * config.__retryCount))
  return apiClient(config)
})

// Set defaults
apiClient.defaults.retry = 3
apiClient.defaults.retryDelay = 1000


export const api = {
  // GET root-level health check — used for backend status indicator
  checkHealth: async () => {
    const res = await rootClient.get('/health')
    return res.data
  },

  // POST upload dataset
  uploadDataset: async (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onUploadProgress(percent)
        }
      },
    })
    return res.data
  },

  // GET list all datasets
  getDatasets: async () => {
    const res = await apiClient.get('/datasets')
    return res.data
  },

  // GET single dataset details
  getDataset: async (id) => {
    const res = await apiClient.get(`/dataset/${id}`)
    return res.data
  },

  // DELETE dataset
  deleteDataset: async (id) => {
    const res = await apiClient.delete(`/dataset/${id}`)
    return res.data
  },

  // POST mine dataset
  mineDataset: async (datasetId, minimumSupport, minimumConfidence) => {
    const res = await apiClient.post('/mine', {
      dataset_id: datasetId,
      minimumSupport,
      minimumConfidence,
    })
    return res.data
  },
}
