import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export type JsonObject = Record<string, unknown>

export const getByPath = (obj: JsonObject, path: string): unknown => {
  return path.split('.').reduce<unknown>((currentValue, keyPart) => {
    if (!currentValue || typeof currentValue !== 'object') {
      return undefined
    }

    return (currentValue as JsonObject)[keyPart]
  }, obj)
}

export const loadLocaleFromDisk = (locale: string): JsonObject => {
  const localePath = resolve(process.cwd(), 'src', 'i18n', `${locale}.json`)

  try {
    const fileContents = readFileSync(localePath, 'utf-8')
    const parsedLocale = JSON.parse(fileContents) as unknown

    if (
      !parsedLocale ||
      typeof parsedLocale !== 'object' ||
      Array.isArray(parsedLocale)
    ) {
      throw new Error(
        `Locale file must export a JSON object: src/i18n/${locale}.json`,
      )
    }

    return parsedLocale as JsonObject
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)

    throw new Error(
      `Failed to load locale file: src/i18n/${locale}.json (${detail})`,
    )
  }
}

export const collectKeyPaths = (obj: JsonObject): string[] => {
  const paths: string[] = []

  const walk = (value: unknown, prefix: string): void => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      paths.push(prefix)
      return
    }

    const entries = Object.entries(value as JsonObject)

    if (entries.length === 0) {
      paths.push(prefix)
      return
    }

    for (const [key, child] of entries) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key
      walk(child, nextPrefix)
    }
  }

  walk(obj, '')

  return paths
    .filter((path) => path.length > 0)
    .sort((left, right) => left.localeCompare(right))
}
