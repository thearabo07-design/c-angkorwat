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

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const allowedAudioTypes = new Set(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm'])

export async function uploadMedia(file: File, kind: 'image' | 'audio') {
  if (!supabase) throw new Error('Supabase is not configured.')
  const allowedTypes = kind === 'image' ? allowedImageTypes : allowedAudioTypes
  const maxBytes = kind === 'image' ? 10 * 1024 * 1024 : 25 * 1024 * 1024
  if (!allowedTypes.has(file.type)) throw new Error(`Choose a supported ${kind} file.`)
  if (file.size > maxBytes) throw new Error(`${kind === 'image' ? 'Images' : 'Audio files'} must be smaller than ${kind === 'image' ? '10' : '25'} MB.`)

  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) throw new Error('Sign in before uploading media.')
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || (kind === 'image' ? 'jpg' : 'mp3')
  const path = `${user.id}/${kind}-${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
