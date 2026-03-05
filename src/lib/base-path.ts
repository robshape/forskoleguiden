/**
 * Returns the Astro base path with any trailing slash removed.
 * Centralizes `import.meta.env.BASE_URL` normalization so components
 * don't each duplicate the same replace pattern.
 */
export const getBasePath = (): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '')
