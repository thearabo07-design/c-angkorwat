import { describe, expect, it } from 'vitest'
import { isLocale, localeNames, targetLocales, uiCopy } from './i18n'

describe('internationalization configuration', () => {
  it('recognizes only supported locales', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('km')).toBe(true)
    expect(isLocale('de')).toBe(false)
  })

  it('has labels for every supported target language', () => {
    for (const locale of targetLocales) {
      expect(localeNames[locale]).toBeTruthy()
      expect(uiCopy[locale].language).toBeTruthy()
    }
  })
})
