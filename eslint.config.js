import astro from 'eslint-plugin-astro'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default [
  includeIgnoreFile(gitignorePath),
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  ...astro.configs['flat/recommended'],
]
