import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogIn, AlertCircle, Loader2, Gauge, Clock, Bell, Cpu } from 'lucide-react'
import { Field, Input } from '../components/FormField'

const FEATURES = [
    { icon: Cpu, text: 'Scores de risque calculés par intelligence artificielle' },
    { icon: Bell, text: 'Alertes automatiques avant la panne' },
]

// Jauge de risque : cercle de rayon 88 → circonférence ≈ 552.9
// 82 % de risque → décalage du trait ≈ 552.9 × (1 - 0.82)
const CIRCUMFERENCE = 2 * Math.PI * 88
const RISK_VALUE = 82
const DASH_OFFSET = CIRCUMFERENCE * (1 - RISK_VALUE / 100)

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
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
                setError("Identifiants incorrects. Vérifiez votre nom d'utilisateur et votre mot de passe.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Panneau de marque */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between px-12 py-10 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* En-tête : logo + statut système */}
                <div className="relative flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        OCP
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        Système opérationnel
                    </div>
                </div>

                {/* Visualisation : jauge de risque + statistiques flottantes */}
                <div className="relative flex-1 flex items-center justify-center my-6">
                    <div className="relative w-64 h-64">
                        {/* point de balayage animé */}
                        <div className="absolute inset-0 animate-[spin_7s_linear_infinite]">
                            <div className="w-2 h-2 rounded-full bg-blue-400 absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_3px_rgba(96,165,250,0.5)]" />
                        </div>

                        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                            <circle
                                cx="100"
                                cy="100"
                                r="88"
                                fill="none"
                                stroke="#EF4444"
                                strokeWidth="9"
                                strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={DASH_OFFSET}
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-semibold text-white font-mono tracking-tight">{RISK_VALUE}%</span>
                            <span className="text-[11px] text-slate-400 mt-1">Score de risque</span>
                            <span className="text-[11px] text-slate-500 mt-0.5">Broyeur à boulets BB-02</span>
                        </div>

                        {/* Statistiques flottantes */}
                        <div className="absolute -top-2 -right-10 bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 -rotate-3 backdrop-blur-sm">
                            <Gauge size={14} className="text-emerald-400" />
                            <div className="leading-tight">
                                <p className="text-xs font-mono font-medium text-white">94.2%</p>
                                <p className="text-[10px] text-slate-400">Disponibilité</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -left-12 bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 rotate-2 backdrop-blur-sm">
                            <Clock size={14} className="text-amber-400" />
                            <div className="leading-tight">
                                <p className="text-xs font-mono font-medium text-white">3.4h</p>
                                <p className="text-[10px] text-slate-400">MTTR moyen</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Titre + points forts */}
                <div className="relative">
                    <h1 className="text-2xl font-semibold text-white tracking-tight leading-snug">
                        Plateforme de maintenance prédictive
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 max-w-sm">
                        Suivi des équipements, planification des interventions et détection anticipée des pannes.
                    </p>
                    <div className="mt-6 space-y-3">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                        <Icon size={14} className="text-blue-400" />
                                    </div>
                                    <span className="text-sm text-slate-300">{f.text}</span>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-xs text-slate-600 mt-8">© 2026 OCP Maintenance — Projet personnel</p>
                </div>
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

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                                />
                                Se souvenir de moi
                            </label>
                            <button type="button" className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-150">
                                Mot de passe oublié ?
                            </button>
                        </div>

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
                        © 2026 — Plateforme de maintenance prédictive
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login