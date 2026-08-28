export type Story = { number: string; title: string; text: string }
export type GalleryItem = { title: string; detail: string; imageUrl: string; className: string }

export type SiteContent = {
  stories: Story[]
  gallery: GalleryItem[]
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
  visit: {
    hours: '5:00 AM — 6:00 PM',
    bestTime: 'Sunrise & early morning',
    guidance: 'Dress respectfully and honour sacred spaces.',
  },
  contact: { email: '', phone: '', socialLabel: '', socialUrl: '' },
}
