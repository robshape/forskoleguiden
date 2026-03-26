// Replaces `{key}` placeholders in a template string with provided values.
// Mirrors the interpolation logic in `t()` (src/i18n/utils.ts) so Preact
// islands can interpolate pre-translated template strings received as props.
export const interpolate = (
  template: string,
  params: Record<string, string | number>,
): string => {
  let result = template
  for (const [key, val] of Object.entries(params)) {
    result = result.replaceAll(`{${key}}`, String(val))
  }
  return result
}
