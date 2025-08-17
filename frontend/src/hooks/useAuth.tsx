'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type User = { id: string; email: string; name: string | null; photoUrl?: string | null; cvUrl?: string | null }
type AuthCtx = {
  user: User | null
  loading: boolean
  signin: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  signout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>(null as any)
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/auth/me`, { credentials: 'include', cache: 'no-store' })
        if (r.ok) setUser(await r.json())
      } catch {}
      setLoading(false)
    })()
  }, [])

  async function signin(email: string, password: string) {
    const r = await fetch(`${API}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.message || 'Failed to sign in')
    setUser(data)
  }

  async function signup(name: string, email: string, password: string) {
    const r = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.message || 'Failed to sign up')
    setUser(data)
  }

  async function signout() {
    await fetch(`${API}/auth/signout`, { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, signin, signup, signout }), [user, loading])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
