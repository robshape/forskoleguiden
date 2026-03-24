import { describe, expect, it } from 'vitest'

import ar from '@/i18n/ar.json'
import en from '@/i18n/en.json'
import sv from '@/i18n/sv.json'

// ---------------------------------------------------------------------------
// US4 — Locale label contract: native-script values are consistent and correct
// ---------------------------------------------------------------------------

describe('locale label contract: native-script values', () => {
  it('sv.json has locale.sv as "Svenska" in native script', () => {
    expect(sv.locale.sv).toBe('Svenska')
  })

  it('sv.json has locale.en as "English" in native script', () => {
    expect(sv.locale.en).toBe('English')
  })

  it('sv.json has locale.ar as "العربية" in native Arabic script', () => {
    expect(sv.locale.ar).toBe('العربية')
  })

  it('en.json locale values match sv.json (locale names are not translated)', () => {
    expect(en.locale.sv).toBe(sv.locale.sv)
    expect(en.locale.en).toBe(sv.locale.en)
    expect(en.locale.ar).toBe(sv.locale.ar)
  })

  it('ar.json locale values match sv.json (locale names are not translated)', () => {
    expect(ar.locale.sv).toBe(sv.locale.sv)
    expect(ar.locale.en).toBe(sv.locale.en)
    expect(ar.locale.ar).toBe(sv.locale.ar)
  })

  it('all three locale files have the languageSwitcherAriaLabel key', () => {
    expect(sv.nav.languageSwitcherAriaLabel).toBeTruthy()
    expect(en.nav.languageSwitcherAriaLabel).toBeTruthy()
    expect(ar.nav.languageSwitcherAriaLabel).toBeTruthy()
  })

  it('Swedish languageSwitcherAriaLabel is in Swedish', () => {
    expect(sv.nav.languageSwitcherAriaLabel).toBe('Välj språk')
  })

  it('English languageSwitcherAriaLabel is in English', () => {
    expect(en.nav.languageSwitcherAriaLabel).toBe('Choose language')
  })

  it('Arabic languageSwitcherAriaLabel is in Arabic', () => {
    expect(ar.nav.languageSwitcherAriaLabel).toBe('اختر اللغة')
  })
})
