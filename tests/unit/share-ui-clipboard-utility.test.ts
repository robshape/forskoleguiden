import { afterEach, describe, expect, it, vi } from 'vitest'

import { copyToClipboard } from '@/lib/clipboard'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('copyToClipboard', () => {
  it('returns true when clipboard.writeText succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const result = await copyToClipboard('https://example.com')
    expect(result).toBe(true)
    expect(writeText).toHaveBeenCalledWith('https://example.com')
  })

  it('returns false when navigator is undefined (SSR)', async () => {
    vi.stubGlobal('navigator', undefined)
    const result = await copyToClipboard('text')
    expect(result).toBe(false)
  })

  it('returns false when clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', {})
    const result = await copyToClipboard('text')
    expect(result).toBe(false)
  })

  it('returns false when clipboard.writeText throws', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    })
    const result = await copyToClipboard('text')
    expect(result).toBe(false)
  })
})
