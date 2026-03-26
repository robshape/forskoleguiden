// lz-string@1.5.0 — last release 2019. Functionally stable (compression is
// a mature problem). Monitor for security advisories; consider lz-ts or fflate
// as drop-in replacements if a vulnerability surfaces.
import LZString from 'lz-string'

import { SHARE_CITY, SURVEY_YEAR } from '@/lib/constants'

export type SharePayload = {
  v: number
  city: string
  year: number
  ids: string[]
}

const SUPPORTED_VERSION = 1

export const encodeShareState = (ids: string[]): string => {
  const payload: SharePayload = {
    v: SUPPORTED_VERSION,
    city: SHARE_CITY,
    year: SURVEY_YEAR,
    ids,
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export const decodeShareState = (encoded: string): SharePayload | null => {
  if (encoded.length > 4096) return null
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded)
    if (!decompressed) return null

    const parsed: unknown = JSON.parse(decompressed)
    if (typeof parsed !== 'object' || parsed === null) return null

    const p = parsed as Record<string, unknown>
    if (
      typeof p.v !== 'number' ||
      p.v !== SUPPORTED_VERSION ||
      typeof p.city !== 'string' ||
      typeof p.year !== 'number' ||
      !Array.isArray(p.ids) ||
      !(p.ids as unknown[]).every((id) => typeof id === 'string')
    ) {
      return null
    }

    return parsed as SharePayload
  } catch (error) {
    console.warn('[share] Failed to decode share state:', error)
    return null
  }
}

export const validateShareIds = (
  payload: SharePayload,
  knownIds: readonly string[],
): { valid: string[]; invalid: string[] } => {
  const knownSet = new Set(knownIds)
  const uniqueIds = [...new Set(payload.ids)]
  const valid: string[] = []
  const invalid: string[] = []

  for (const id of uniqueIds) {
    if (knownSet.has(id)) {
      valid.push(id)
    } else {
      invalid.push(id)
    }
  }

  return { valid, invalid }
}
