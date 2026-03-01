import ar from '@/i18n/ar.json'
import en from '@/i18n/en.json'
import sv from '@/i18n/sv.json'

export type Locale = 'sv' | 'en' | 'ar'

const translations: Record<Locale, unknown> = {
  sv,
  en,
  ar,
}

const localeSet = new Set<Locale>(['sv', 'en', 'ar'])

export function getLocaleFromURL(url: URL | string): Locale {
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

export function t(key: string, locale: Locale): string {
  const value = key.split('.').reduce<unknown>((currentValue, currentKey) => {
    if (typeof currentValue !== 'object' || currentValue === null) {
      return undefined
    }

    return (currentValue as Record<string, unknown>)[currentKey]
  }, translations[locale])

  return typeof value === 'string' ? value : key
}
