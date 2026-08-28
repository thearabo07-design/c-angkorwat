import { createClient } from '@supabase/supabase-js'
import { siteContentSchema, type SiteContent } from '../content'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && publishableKey)
export const supabase = isSupabaseConfigured ? createClient(url!, publishableKey!) : null

export async function loadSiteContent(): Promise<SiteContent | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle()
  if (error) throw error
  if (!data?.content) return null
  const parsed = siteContentSchema.safeParse(data.content)
  if (!parsed.success) throw new Error('Published content has an invalid structure.')
  return parsed.data
}

export async function saveSiteContent(content: SiteContent) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const validated = siteContentSchema.parse(content)
  const { error } = await supabase.from('site_content').upsert({ id: 'main', content: validated, updated_at: new Date().toISOString() })
  if (error) throw error
}
