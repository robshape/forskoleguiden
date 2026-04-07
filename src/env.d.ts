/// <reference types="astro/client" />

// Extend ImportMetaEnv here if custom environment variables are added.
// See https://docs.astro.build/en/guides/environment-variables/#intellisense-for-typescript

// Window augmentation for the shared nanostore singleton used by Preact islands.
// The actual CompareStoreContainer interface is defined in src/lib/state.ts;
// we use an opaque record here to avoid circular imports while keeping
// accidental access type-safe.
interface Window {
  __forskoleguidenCompareStore__?: {
    store: import('nanostores').PreinitializedWritableAtom<string[]>
    persistenceBound: boolean
  }
}
