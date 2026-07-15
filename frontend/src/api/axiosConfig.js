import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
})

// 🔐 Intercepteur de requête : ajoute TOUJOURS le token, sauf pour les endpoints d'auth
api.interceptors.request.use(
    (config) => {
        // Ne pas ajouter de token pour les endpoints d'authentification (login, refresh, register)
        const isAuthEndpoint = config.url.includes('/auth/')
        if (isAuthEndpoint) {
            return config
        }

        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        } else {
            // Si aucun token et qu'on n'est pas sur une route d'auth, on redirige vers login
            // mais on laisse la requête échouer pour que l'intercepteur de réponse puisse gérer
            console.warn(`⚠️ Aucun token pour ${config.url}`)
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 🔄 Intercepteur de réponse : gère le refresh token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Si erreur 401 et qu'on n'a pas encore tenté de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Si on est déjà en train de refresh, mettre en file d'attente
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const refresh = localStorage.getItem('refresh_token')
            if (!refresh) {
                // Pas de refresh token → déconnexion
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const { data } = await axios.post('/api/auth/refresh/', { refresh })
                const newAccessToken = data.access
                localStorage.setItem('access_token', newAccessToken)

                // Mettre à jour le header pour cette requête
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                // Traiter la file d'attente
                processQueue(null, newAccessToken)

                // Réessayer la requête originale
                return api(originalRequest)
            } catch (refreshError) {
                // Refresh échoué → déconnexion
                processQueue(refreshError, null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api