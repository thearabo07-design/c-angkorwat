import { describe, expect, it } from 'vitest'
import { defaultContent, siteContentSchema } from './content'

describe('siteContentSchema', () => {
  it('accepts the trusted default content', () => {
    expect(siteContentSchema.parse(defaultContent)).toEqual(defaultContent)
  })

  it('rejects unsafe gallery URLs', () => {
    const result = siteContentSchema.safeParse({
      ...defaultContent,
      gallery: [{ ...defaultContent.gallery[0], imageUrl: 'javascript:alert(1)' }],
    })

    expect(result.success).toBe(false)
  })

  it('rejects malformed contact email addresses', () => {
    const result = siteContentSchema.safeParse({
      ...defaultContent,
      contact: { ...defaultContent.contact, email: 'not-an-email' },
    })

    expect(result.success).toBe(false)
  })

  it('keeps older published content compatible by defaulting media collections', () => {
    const { audio: _audio, models: _models, ...olderContent } = defaultContent
    const parsed = siteContentSchema.parse(olderContent)
    expect(parsed.audio).toEqual([])
    expect(parsed.models).toEqual([])
  })

  it('rejects unsafe audio URLs', () => {
    const result = siteContentSchema.safeParse({
      ...defaultContent,
      audio: [{ title: 'Temple bells', description: '', audioUrl: 'javascript:alert(1)' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects unsafe 3D model URLs', () => {
    const result = siteContentSchema.safeParse({
      ...defaultContent,
      models: [{ title: 'Temple', description: '', modelUrl: 'javascript:alert(1)', iosUrl: '', posterUrl: '' }],
    })
    expect(result.success).toBe(false)
  })
})
