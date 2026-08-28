import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AccessState = 'loading' | 'signed-out' | 'forbidden' | 'allowed'

export default function AdminRoute() {
  const [access, setAccess] = useState<AccessState>(isSupabaseConfigured ? 'loading' : 'signed-out')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const client = supabase
    if (!client) return

    const checkAccess = async () => {
      const { data } = await client.auth.getSession()
      const user = data.session?.user
      if (!user) return setAccess('signed-out')
      const { data: role, error } = await client.from('user_roles').select('role').eq('user_id', user.id).in('role', ['admin', 'super_admin']).maybeSingle()
      setAccess(!error && role ? 'allowed' : 'forbidden')
    }

    checkAccess()
    const { data } = client.auth.onAuthStateChange(() => checkAccess())
    return () => data.subscription.unsubscribe()
  }, [])

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage('Sign-in failed. Check your email and password.')
  }

  if (!isSupabaseConfigured) return <main className="admin-login"><section><Link to="/" className="admin-brand">☼ C Angkorwat</Link><p className="admin-kicker">Secure administration</p><h1>Setup required.</h1><p>The admin area stays locked until the Supabase project URL and publishable key are configured.</p><Link className="admin-return" to="/">Return to public site</Link></section></main>
  if (access === 'loading') return <main className="admin-login"><p role="status">Checking administrator access…</p></main>
  if (access === 'forbidden') return <main className="admin-login"><section><p className="admin-kicker">Access denied</p><h1>Administrator role required.</h1><p>Your account is signed in but has not been assigned an administrator role.</p><button onClick={() => supabase?.auth.signOut()}>Sign out</button></section></main>
  if (access === 'signed-out') return <main className="admin-login"><form onSubmit={signIn}><Link to="/" className="admin-brand">☼ C Angkorwat</Link><p className="admin-kicker">Secure administration</p><h1>Welcome back.</h1><label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <p className="admin-notice" role="alert">{message}</p>}<button type="submit">Sign in</button></form></main>
  return <Outlet />
}
