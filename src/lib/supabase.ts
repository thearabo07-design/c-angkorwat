import { createClient } from '@supabase/supabase-js'
import type { SiteContent } from '../content'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)
export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null

export async function loadSiteContent(): Promise<SiteContent | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle()
  if (error) throw error
  return (data?.content as SiteContent | undefined) ?? null
}

export async function saveSiteContent(content: SiteContent) {
  if (!supabase) return
  const { error } = await supabase.from('site_content').upsert({ id: 'main', content, updated_at: new Date().toISOString() })
  if (error) throw error
}
