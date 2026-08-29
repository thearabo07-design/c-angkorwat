import { createClient } from '@supabase/supabase-js'
import { siteContentSchema, type SiteContent } from '../content'
import type { Locale, TranslationRecord, TranslationStatus } from '../i18n'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && publishableKey)
export const supabase = isSupabaseConfigured ? createClient(url!, publishableKey!) : null

export async function loadSiteContent(locale: Locale = 'en'): Promise<SiteContent | null> {
  if (!supabase) return null
  const query = locale === 'en'
    ? supabase.from('site_content').select('content').eq('id', 'main')
    : supabase.from('site_translations').select('content').eq('locale', locale).eq('status', 'published')
  const { data, error } = await query.maybeSingle()
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
  await supabase.from('site_translations').update({ status: 'stale', updated_at: new Date().toISOString() }).neq('status', 'stale')
}

export async function loadTranslation(locale: Exclude<Locale, 'en'>): Promise<TranslationRecord | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_translations').select('*').eq('locale', locale).maybeSingle()
  if (error) throw error
  if (!data) return null
  const parsed = siteContentSchema.safeParse(data.content)
  if (!parsed.success) throw new Error('Translation has an invalid structure.')
  return { ...data, content: parsed.data } as TranslationRecord
}

export async function saveTranslation(locale: Exclude<Locale, 'en'>, content: SiteContent, status: TranslationStatus) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: userData } = await supabase.auth.getUser()
  const now = new Date().toISOString()
  const { error } = await supabase.from('site_translations').upsert({
    locale,
    content: siteContentSchema.parse(content),
    status,
    updated_at: now,
    reviewed_at: status === 'reviewed' || status === 'published' ? now : null,
    reviewer: status === 'reviewed' || status === 'published' ? userData.user?.id ?? null : null,
  })
  if (error) throw error
}

export async function requestAiTranslation(locale: Exclude<Locale, 'en'>, sourceContent: SiteContent) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('translate-content', { body: { source_language: 'en', target_language: locale, source_content: sourceContent } })
  if (error) throw error
  const parsed = siteContentSchema.safeParse(data?.content)
  if (!parsed.success) throw new Error('The AI returned an invalid translation.')
  return parsed.data
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const allowedAudioTypes = new Set(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm'])
const allowedModelTypes = new Set(['model/gltf-binary', 'model/vnd.usdz+zip', 'application/octet-stream'])

export async function uploadMedia(file: File, kind: 'image' | 'audio' | 'model') {
  if (!supabase) throw new Error('Supabase is not configured.')
  const allowedTypes = kind === 'image' ? allowedImageTypes : kind === 'audio' ? allowedAudioTypes : allowedModelTypes
  const maxBytes = kind === 'image' ? 10 * 1024 * 1024 : 25 * 1024 * 1024
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
  const validModelExtension = kind === 'model' && ['glb', 'usdz'].includes(extension)
  if (!allowedTypes.has(file.type) && !validModelExtension) throw new Error(`Choose a supported ${kind} file.`)
  if (file.size > maxBytes) throw new Error(`${kind === 'image' ? 'Images' : kind === 'audio' ? 'Audio files' : '3D models'} must be smaller than ${kind === 'image' ? '10' : '25'} MB.`)

  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) throw new Error('Sign in before uploading media.')
  const safeExtension = extension || (kind === 'image' ? 'jpg' : kind === 'audio' ? 'mp3' : 'glb')
  const contentType = file.type || (safeExtension === 'usdz' ? 'model/vnd.usdz+zip' : 'model/gltf-binary')
  const path = `${user.id}/${kind}-${crypto.randomUUID()}.${safeExtension}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType, upsert: false })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
