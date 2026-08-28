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
})
