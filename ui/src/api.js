import axios from 'axios'

const api = axios.create({
  baseURL: window.ArtisanUI?.apiUrl || '/artisan-ui/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
})

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (token) {
    config.headers['X-CSRF-TOKEN'] = token
  }
  return config
})

// Response interceptor to handle errors and validate data
api.interceptors.response.use(
  (response) => {
    // Ensure response.data exists and is properly formatted
    if (!response.data) {
      response.data = {}
    }
    return response
  },
  (error) => {
    // Handle network errors and invalid responses
    if (!error.response) {
      console.error('[ArtisanUI API] Network error:', error.message)
      return Promise.reject({
        response: {
          status: 0,
          data: { message: 'Network error: ' + error.message }
        }
      })
    }
    
    // Log API errors for debugging
    console.error('[ArtisanUI API] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    })
    
    return Promise.reject(error)
  }
)

export default api
