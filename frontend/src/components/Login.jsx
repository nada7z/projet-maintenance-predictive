import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Lock, LogIn, Building2 } from 'lucide-react'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const success = await login(username, password)
        setLoading(false)
        if (success) navigate('/dashboard')
        else alert('Identifiants incorrects')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md">
                <div className="w-40 h-40 border-2 border-white/30 rounded-full absolute -top-10 -right-10 blur-sm"></div>
                <div className="w-20 h-20 border-2 border-white/30 rounded-full absolute -bottom-5 -left-5 blur-sm"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <Building2 className="text-white" size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 text-center">Bienvenue</h2>
                    <p className="text-gray-500 text-center mt-1 mb-8">Plateforme de Maintenance Prédictive</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom d'utilisateur</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Entrez votre nom"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    placeholder="Entrez votre mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Connexion...' : (
                                <>
                                    <LogIn size={20} />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <p className="text-center text-gray-400 text-xs mt-6">
                    © 2026 OCP Maintenance – Projet Personnel
                </p>
            </div>
        </div>
    )
}

export default Login