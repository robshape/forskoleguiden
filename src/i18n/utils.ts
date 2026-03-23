import ar from '@/i18n/ar.json'
import en from '@/i18n/en.json'
import sv from '@/i18n/sv.json'

export const LOCALES = ['sv', 'en', 'ar'] as const

export type Locale = (typeof LOCALES)[number]
type TranslationParams = Record<string, string | number>
type TranslationSchema = typeof sv

const translations = {
  sv,
  en,
  ar,
} satisfies Record<Locale, TranslationSchema>

export const localeSet = new Set<Locale>(LOCALES)

// Used by Phase 2 multi-locale routes — keep even if currently unused in pages.
export const getLocaleFromURL = (url: URL | string): Locale => {
  const pathname =
    typeof url === 'string'
      ? new URL(url, 'https://example.com').pathname
      : url.pathname

  const [firstSegment] = pathname.split('/').filter(Boolean)

  if (firstSegment && localeSet.has(firstSegment as Locale)) {
    return firstSegment as Locale
  }

  return 'sv'
}

const interpolateTemplate = (template: string, params?: TranslationParams) => {
  if (!params) {
    return template
  }

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token) => {
    const value = params[token]

    return value === undefined ? match : String(value)
  })
}

export const t = (key: string, locale: Locale, params?: TranslationParams) => {
  const value = key.split('.').reduce<unknown>((currentValue, currentKey) => {
    if (typeof currentValue !== 'object' || currentValue === null) {
      return undefined
    }

    return (currentValue as Record<string, unknown>)[currentKey]
  }, translations[locale])

  return typeof value === 'string' ? interpolateTemplate(value, params) : key
}
