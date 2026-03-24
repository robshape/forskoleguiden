import { type Locale, LOCALES } from '@/i18n/utils'

const validLocales = new Set<string>(LOCALES)
const rtlLocales = new Set<Locale>(['ar'])

export const isRtlLocale = (locale: Locale): boolean => rtlLocales.has(locale)

/**
 * Builds the URL for the equivalent page in a target locale by replacing
 * the locale segment in the current pathname.
 *
 * @param pathname   - `Astro.url.pathname` (includes basePath prefix)
 * @param targetLocale - The locale to switch to
 * @param basePath   - Output of `getBasePath()` (e.g. `/forskoleguiden`)
 * @returns Full path for the target locale page. Query params are always dropped.
 */
export const buildLocaleSwitchUrl = (
  pathname: string,
  targetLocale: Locale,
  basePath: string,
): string => {
  const relativePath = pathname.slice(basePath.length)

  const segments = relativePath.split('/')
  const potentialLocale = segments[1]

  if (potentialLocale && validLocales.has(potentialLocale)) {
    segments[1] = targetLocale
    return basePath + segments.join('/')
  }

  return `${basePath}/${targetLocale}/`
}
