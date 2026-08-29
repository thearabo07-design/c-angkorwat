import type { SiteContent } from './content'

export const locales = ['en', 'km', 'fr', 'zh-CN'] as const
export type Locale = (typeof locales)[number]
export type TranslationStatus = 'draft' | 'reviewed' | 'published' | 'stale'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  km: 'ខ្មែរ',
  fr: 'Français',
  'zh-CN': '简体中文',
}

export type TranslationRecord = {
  locale: Exclude<Locale, 'en'>
  content: SiteContent
  status: TranslationStatus
  ai_model: string | null
  source_updated_at: string | null
  created_at: string
  updated_at: string
  reviewed_at: string | null
  reviewer: string | null
}

export const targetLocales = locales.filter((locale): locale is Exclude<Locale, 'en'> => locale !== 'en')

export function isLocale(value: string | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale))
}

export function getInitialLocale(): Locale {
  const saved = localStorage.getItem('c-angkorwat-locale')
  return isLocale(saved) ? saved : 'en'
}

export const glossary = {
  'Angkor Wat': { km: 'អង្គរវត្ត', fr: 'Angkor Wat', 'zh-CN': '吴哥窟' },
  Khmer: { km: 'ខ្មែរ', fr: 'khmer', 'zh-CN': '高棉' },
  Cambodia: { km: 'កម្ពុជា', fr: 'Cambodge', 'zh-CN': '柬埔寨' },
}

export const uiCopy: Record<Locale, Record<string, string>> = {
  en: { home: 'Home', history: 'History', explore: 'Explore', gallery: 'Gallery', models: '3D & AR', listen: 'Listen', visit: 'Visit', guide: 'Guide', contact: 'Contact', language: 'Language' },
  km: { home: 'ទំព័រដើម', history: 'ប្រវត្តិសាស្ត្រ', explore: 'ស្វែងយល់', gallery: 'វិចិត្រសាល', models: '3D និង AR', listen: 'ស្តាប់', visit: 'ទស្សនា', guide: 'មគ្គុទ្ទេសក៍', contact: 'ទំនាក់ទំនង', language: 'ភាសា' },
  fr: { home: 'Accueil', history: 'Histoire', explore: 'Explorer', gallery: 'Galerie', models: '3D et RA', listen: 'Écouter', visit: 'Visiter', guide: 'Guide', contact: 'Contact', language: 'Langue' },
  'zh-CN': { home: '首页', history: '历史', explore: '探索', gallery: '图库', models: '3D 与 AR', listen: '聆听', visit: '参观', guide: '指南', contact: '联系', language: '语言' },
}
