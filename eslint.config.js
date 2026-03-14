import astro from 'eslint-plugin-astro'
import tailwindcss from 'eslint-plugin-better-tailwindcss'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default [
  includeIgnoreFile(gitignorePath),
  {
    files: ['**/*.{ts,tsx}'],
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
  {
    files: ['**/*.{ts,tsx,astro}'],
    plugins: {
      'better-tailwindcss': tailwindcss,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
      },
    },
    rules: {
      ...tailwindcss.configs.recommended.rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
  },
]
