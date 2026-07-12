import React, { createContext, useState, useContext } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login/', { username, password })
            const { access, refresh } = response.data
            localStorage.setItem('access_token', access)
            localStorage.setItem('refresh_token', refresh)
            const userResponse = await api.get('/auth/profile/')
            setUser(userResponse.data)
            return true
        } catch (error) {
            console.error('Login failed', error)
            return false
        }
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)