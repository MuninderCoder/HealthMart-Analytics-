import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for processing larger files
})

export const api = {
  // GET health check
  checkHealth: async () => {
    const res = await client.get('/health')
    return res.data
  },

  // POST upload dataset
  uploadDataset: async (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await client.post('/upload', formData, {
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
    const res = await client.get('/datasets')
    return res.data
  },

  // GET single dataset details
  getDataset: async (id) => {
    const res = await client.get(`/dataset/${id}`)
    return res.data
  },

  // DELETE dataset
  deleteDataset: async (id) => {
    const res = await client.delete(`/dataset/${id}`)
    return res.data
  },
}
