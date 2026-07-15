import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogIn, Building2, AlertCircle, Loader2, Gauge, Cpu, Bell } from 'lucide-react'
import { Field, Input } from '../components/FormField'

const FEATURES = [
    { icon: Gauge, text: 'Disponibilité et MTTR suivis en temps réel' },
    { icon: Cpu, text: 'Scores de risque calculés par intelligence artificielle' },
    { icon: Bell, text: "Alertes automatiques avant la panne" },
]

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const success = await login(username, password)
            if (success) {
                navigate('/dashboard')
            } else {
                setError('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et votre mot de passe.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Panneau de marque */}
            <div className="hidden lg:flex lg:w-[42%] bg-slate-900 flex-col justify-between px-12 py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }} />

                <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        OCP
                    </div>
                </div>

                <div className="relative">
                    <h1 className="text-3xl font-semibold text-white tracking-tight leading-snug">
                        Plateforme de maintenance prédictive
                    </h1>
                    <p className="text-slate-400 text-sm mt-3 max-w-sm">
                        Suivi des équipements, planification des interventions et détection anticipée des pannes.
                    </p>

                    <div className="mt-10 space-y-4">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                        <Icon size={15} className="text-blue-400" />
                                    </div>
                                    <span className="text-sm text-slate-300">{f.text}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <p className="relative text-xs text-slate-500">© 2026 OCP Maintenance — Projet personnel</p>
            </div>

            {/* Formulaire */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            OCP
                        </div>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Bienvenue</h2>
                        <p className="text-slate-500 text-sm mt-1">Connectez-vous pour accéder à votre tableau de bord</p>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Nom d'utilisateur">
                            <Input
                                type="text"
                                placeholder="j.dupont"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </Field>

                        <Field label="Mot de passe">
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </Field>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <Loader2 size={17} className="animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>

                    <p className="lg:hidden text-center text-slate-400 text-xs mt-8">
                        © 2026 Projet — Plateforme de maintenance prédictive
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login