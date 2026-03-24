# Data Model: Language Switcher

**Branch**: `002-language-switcher` | **Date**: 2026-03-23

## Overview

The language switcher feature introduces no new persistent data entities. All data is computed at build time and embedded into static HTML. There is no runtime state, no `sessionStorage` interaction, and no changes to the preschool data model.

The relevant "data" is a compile-time configuration — a fixed list of supported locales with their display properties — and a derived URL computation.

---

## Compile-Time Configuration

### `LocaleConfig` (build-time constant, not persisted)

Defined as a constant array in `LanguageSwitcher.astro` (or in the new `src/lib/locale-switch.ts` utility).

| Field        | Type                              | Description                                                            | Example     |
| ------------ | --------------------------------- | ---------------------------------------------------------------------- | ----------- |
| `code`       | `Locale` (`'sv' \| 'en' \| 'ar'`) | The locale identifier. Used in URL paths.                              | `'sv'`      |
| `isoCode`    | `string`                          | Uppercase ISO abbreviation for narrow viewports.                       | `'SV'`      |
| `nativeName` | `string`                          | Full locale name in its own script, from `t('locale.{code}', locale)`. | `'Svenska'` |
| `flag`       | `string`                          | Unicode emoji flag character, `aria-hidden`.                           | `'🇸🇪'`      |
| `lang`       | `string`                          | BCP 47 language tag for the `lang` attribute on locale links.          | `'sv'`      |

**Instances** (all three locales, fixed at build time):

| `code` | `isoCode` | `nativeName` | `flag` | `lang` |
| ------ | --------- | ------------ | ------ | ------ |
| `sv`   | `SV`      | `Svenska`    | `🇸🇪`   | `sv`   |
| `en`   | `EN`      | `English`    | `🇬🇧`   | `en`   |
| `ar`   | `AR`      | `العربية`    | `🇸🇦`   | `ar`   |

> Note: `nativeName` values come from the i18n translation keys `locale.sv`, `locale.en`, `locale.ar`. These keys hold the same native-script values in all three locale files — they are not translated into the current locale.

---

## i18n Key Schema Additions

### New keys added to all three locale files (`sv.json`, `en.json`, `ar.json`)

All three locale files must have identical key structures (enforced by `i18n-locale-key-parity.test.ts`). The following keys are added at the same nesting level.

**`locale` group** (new top-level key group):

| Key path    | `sv.json` value | `en.json` value | `ar.json` value |
| ----------- | --------------- | --------------- | --------------- |
| `locale.sv` | `"Svenska"`     | `"Svenska"`     | `"Svenska"`     |
| `locale.en` | `"English"`     | `"English"`     | `"English"`     |
| `locale.ar` | `"العربية"`     | `"العربية"`     | `"العربية"`     |

> Values are **not translated into the current locale**. Each locale name always appears in its own native script regardless of which locale is active. This is intentional (see Assumption in spec: "locale name labels are intentionally not translated").

**`nav` group** (additions to existing group):

| Key path                        | `sv.json` value | `en.json` value     | `ar.json` value |
| ------------------------------- | --------------- | ------------------- | --------------- |
| `nav.languageSwitcherAriaLabel` | `"Välj språk"`  | `"Choose language"` | `"اختر اللغة"`  |

> This key replaces the role previously served by `nav.languagePlaceholder` and `nav.languageComingSoon`. Those two keys become unused once `LanguageSwitcher.astro` replaces the placeholder `<span>` in `Nav.astro`. They may be cleaned up in a follow-up or at implementation time.

---

## URL Computation Model

### `buildLocaleSwitchUrl` (pure function in `src/lib/locale-switch.ts`)

**Inputs**:

| Parameter      | Type     | Description                                                               |
| -------------- | -------- | ------------------------------------------------------------------------- |
| `pathname`     | `string` | `Astro.url.pathname` — full path of the current page, including base path |
| `targetLocale` | `Locale` | The locale to switch to                                                   |
| `basePath`     | `string` | Output of `getBasePath()` (e.g., `'/forskoleguiden'`)                     |

**Output**: `string` — the full path for the target locale equivalent page.

**Algorithm**:

1. Strip `basePath` prefix from `pathname` → `relativePath` (e.g., `/sv/forskola/alma-forskola/`)
2. Split `relativePath` by `/` → segments (e.g., `['', 'sv', 'forskola', 'alma-forskola', '']`)
3. If `segments[1]` is a known locale (`'sv' | 'en' | 'ar'`), replace it with `targetLocale`
4. Rejoin segments and prepend `basePath`
5. If `segments[1]` is NOT a known locale → fallback: return `${basePath}/${targetLocale}/`
6. Query params are always dropped (not part of `pathname`; `Astro.url.search` is not used)

**Examples**:

| Input `pathname`                             | `targetLocale` | Output                                       |
| -------------------------------------------- | -------------- | -------------------------------------------- |
| `/forskoleguiden/sv/`                        | `en`           | `/forskoleguiden/en/`                        |
| `/forskoleguiden/sv/forskola/alma-forskola/` | `en`           | `/forskoleguiden/en/forskola/alma-forskola/` |
| `/forskoleguiden/sv/jamfor/`                 | `ar`           | `/forskoleguiden/ar/jamfor/`                 |
| `/forskoleguiden/sv/om/`                     | `ar`           | `/forskoleguiden/ar/om/`                     |
| `/forskoleguiden/` (no locale segment)       | `en`           | `/forskoleguiden/en/`                        |

---

## Component Interface

### `LanguageSwitcher.astro` props

| Prop     | Type     | Required | Description                                                                                              |
| -------- | -------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `locale` | `Locale` | Yes      | The currently active locale. Used to look up the `aria-label` translation and to mark the active option. |

> `currentPath` is **not** a prop. The component reads `Astro.url.pathname` directly (see research Decision 2).

### `Nav.astro` props (no change)

| Prop     | Type     | Required | Description                       |
| -------- | -------- | -------- | --------------------------------- |
| `locale` | `Locale` | Yes      | Unchanged from current interface. |

`Nav.astro` passes `locale` down to `LanguageSwitcher.astro`. No new props needed at the Nav level.
