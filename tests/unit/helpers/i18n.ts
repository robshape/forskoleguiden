export type JsonObject = Record<string, unknown>

export const getByPath = (obj: JsonObject, path: string): unknown => {
  return path.split('.').reduce<unknown>((currentValue, keyPart) => {
    if (!currentValue || typeof currentValue !== 'object') {
      return undefined
    }

    return (currentValue as JsonObject)[keyPart]
  }, obj)
}
