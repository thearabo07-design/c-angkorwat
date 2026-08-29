import { z } from 'zod'

export type Story = { number: string; title: string; text: string }
export type GalleryItem = { title: string; detail: string; imageUrl: string; className: string }
export type AudioItem = { title: string; description: string; audioUrl: string }
export type ModelItem = { title: string; description: string; modelUrl: string; iosUrl: string; posterUrl: string }

export type SiteContent = {
  stories: Story[]
  gallery: GalleryItem[]
  audio: AudioItem[]
  models: ModelItem[]
  visit: { hours: string; bestTime: string; guidance: string }
  contact: { email: string; phone: string; socialLabel: string; socialUrl: string }
}

export const defaultContent: SiteContent = {
  stories: [
    { number: '01', title: 'History', text: 'Raised in the early 12th century, Angkor Wat remains a profound expression of Khmer devotion, vision, and craft.' },
    { number: '02', title: 'Architecture', text: 'Five lotus-bud towers, galleries of stone reliefs, and a vast moat create a temple designed as a sacred universe.' },
    { number: '03', title: 'Living Culture', text: 'Angkor is more than a monument: it is a place of worship, memory, and enduring Cambodian identity.' },
  ],
  gallery: [
    { title: 'Angkor at first light', detail: 'A temple shaped by dawn', imageUrl: '', className: 'gallery-temple' },
    { title: 'Stories in stone', detail: 'Devotion in every detail', imageUrl: '', className: 'gallery-carving' },
    { title: 'Sacred reflections', detail: 'Still water, open sky', imageUrl: '', className: 'gallery-water' },
    { title: 'The forest remembers', detail: 'Nature surrounding heritage', imageUrl: '', className: 'gallery-forest' },
  ],
  audio: [],
  models: [],
  visit: {
    hours: '5:00 AM — 6:00 PM',
    bestTime: 'Sunrise & early morning',
    guidance: 'Dress respectfully and honour sacred spaces.',
  },
  contact: { email: '', phone: '', socialLabel: '', socialUrl: '' },
}

const text = z.string().trim().min(1).max(5000)
const optionalUrl = z.union([z.literal(''), z.url().refine((value) => value.startsWith('https://'), 'Use an HTTPS URL')])

export const siteContentSchema: z.ZodType<SiteContent> = z.object({
  stories: z.array(z.object({ number: z.string().max(10), title: text, text })).min(1).max(50),
  gallery: z.array(z.object({ title: text, detail: text, imageUrl: optionalUrl, className: z.string().max(80) })).max(100),
  audio: z.array(z.object({ title: text, description: z.string().trim().max(5000), audioUrl: optionalUrl })).max(50).default([]),
  models: z.array(z.object({ title: text, description: z.string().trim().max(5000), modelUrl: optionalUrl, iosUrl: optionalUrl, posterUrl: optionalUrl })).max(25).default([]),
  visit: z.object({ hours: text, bestTime: text, guidance: text }),
  contact: z.object({
    email: z.union([z.literal(''), z.email()]),
    phone: z.string().max(50),
    socialLabel: z.string().max(100),
    socialUrl: optionalUrl,
  }),
})
