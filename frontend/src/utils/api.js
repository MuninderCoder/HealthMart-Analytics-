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
