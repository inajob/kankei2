import { writable } from 'svelte/store'
import { supabase } from './supabaseClient'
import type { Session } from '@supabase/supabase-js'

export const session = writable<Session | null>(null)
export const authLoading = writable(true)
export const allowed = writable<boolean | null>(null)

supabase.auth.getSession().then(({ data }) => {
  session.set(data.session)
  authLoading.set(false)
})

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.set(newSession)
  if (!newSession) allowed.set(null)
})

export async function checkAllowed(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_allowed')
    const ok = !error && data === true
    allowed.set(ok)
    return ok
  } catch {
    allowed.set(false)
    return false
  }
}

// リダイレクト先: VITE_SITE_URL があればそれを最優先（GitHub Pages などの本番URLを固定）
// なければ現在表示中のURL（localhost での開発時はそのまま戻ってくる）
function redirectUrl(): string {
  const env = import.meta.env.VITE_SITE_URL as string | undefined
  if (env && env.trim()) return env.trim().replace(/\/+$/, '')
  return `${window.location.origin}${window.location.pathname}`
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl() },
  })
  if (error) throw error
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUp(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
