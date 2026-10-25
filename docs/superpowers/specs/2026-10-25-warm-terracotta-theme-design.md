# Warm Terracotta Theme — Design

**Date:** 2026-10-25
**Status:** Approved design, pending spec review
**Applies to:** `aqari-flutter` (mobile) and `aqari-web-finaly` (web). The same file lives in both repos.
**Out of scope:** `aqari-dashboard`, `aqari-backend`, typography, corner radii, component shapes, adding dark mode to web.

## Goal

Replace the orange brand (`#F5A623` with dark text) with a full warm palette built on
**terracotta `#B5603F`** (primary) and **sand `#E0A87E`** (secondary) across both apps.
Neutrals also turn warm: cream page background, white cards, warm brown-grey text and
dividers. Mobile gets a matching warm dark mode.

## Decisions

| Question | Decision |
|---|---|
| Scope | Full warm palette (brand + neutrals + Flutter dark mode) |
| Button style | Terracotta fill with **white** text; sand for chips, badges and highlights |
| Page background | Cream `#FCF8F4` with white `#FFFFFF` cards |
| Web migration | Semantic Tailwind tokens; every hardcoded color class converted |
| Git | Work directly on `main` in each repo; no feature branches |

## 1. Shared palette

Token names are shared. Flutter uses camelCase (`primarySoft`); web uses kebab-case
(`primary-soft`). Web uses only the Light column.

| Token (Flutter / web) | Light | Dark | Role |
|---|---|---|---|
| `primary` / `primary` | `#B5603F` | `#B5603F` | Buttons, active tab, FAB, selected filters, icons |
| `primaryHover` / `primary-hover` | `#9A4E32` | `#9A4E32` | Pressed/hover fill (replaces `#E09400`) |
| `onPrimary` / `on-primary` | `#FFFFFF` | `#FFFFFF` | Text/icons on primary fill |
| `accentText` / `accent-text` | `#9A4E32` | `#E0A87E` | Small colored text: prices, links, captions |
| `secondary` / `secondary` | `#E0A87E` | `#E0A87E` | Chips, badges, "featured" tags |
| `onSecondary` / `on-secondary` | `#2B211C` | `#2B211C` | Text on sand |
| `primarySoft` / `primary-soft` | `#F6E8DF` | `#3A251C` | Tinted backgrounds (replaces `#FFF3E0`, `#FFF8EC`, `orange-50`, `amber-50`) |
| `background` / `canvas` | `#FCF8F4` | `#1A1512` | Scaffold / page background |
| `surface` / `surface` | `#F5EDE6` | `#241D19` | Inputs, grouped sections |
| `card` / `card` | `#FFFFFF` | `#2E2520` | Cards |
| `divider` / `line` | `#EADFD6` | `#3D332C` | Borders and dividers |
| `textPrimary` / `ink` | `#2B211C` | `#F5EDE6` | Main text |
| `textSecondary` / `muted` | `#75655B` | `#BFAFA3` | Secondary text, icons |
| `textHint` / `hint` | `#A8988D` | `#8C7C70` | Placeholder text (Flutter `AppPalette.textHint` still returns `textSecondary`, as today) |
| `error` / `error` | `#C2362F` | `#E5675F` | Errors. Kept clearly redder than terracotta |
| `errorSoft` / `error-soft` | `#FBEAE8` | `#3A1F1C` | Error backgrounds (replaces `red-50`) |
| `success` / `success` | `#2F7D5B` | `#7CC4A0` | Success (replaces teal `#00A699`, `#11998E`) |
| `successSoft` / `success-soft` | `#EAF4EE` | `#1C2E25` | Success backgrounds (replaces `green-50`, `emerald-50`) |
| `warning` / `warning` | `#C98A1E` | `#E5B25C` | Warnings |
| `info` / `info` | `#3E7CB1` | `#7FB0DB` | Info |

Unchanged: shadows and overlays stay black with alpha, `white`/`black`/`transparent`
utilities stay, and third-party brand colors are kept (Google `#4285F4`, WhatsApp
`#25D366` / `#1ebe5d`).

### Contrast (WCAG 2.1, measured)

| Pair | Ratio |
|---|---|
| white on `primary` | 4.46 (OK for buttons and bold/large labels; small body text must not use it) |
| white on `primaryHover` | 5.98 |
| `accentText` light on canvas / card / surface / primarySoft | 5.66 / 5.98 / 5.17 / 4.99 |
| `ink` on `secondary` | 7.53 |
| `ink` on canvas | 14.86 |
| `muted` on canvas / surface | 5.27 / 4.81 |
| `error` on canvas | 5.14 |
| `success` on canvas | 4.73 |
| dark: text on bg | 15.64 |
| dark: `muted` on card | 7.05 |
| dark: sand `accentText` on bg / card | 8.68 / 7.19 |

**Rule:** `primary` is for fills, icons, bold headings and large prices. Small regular-weight
colored text uses `accentText`.

## 2. Mobile — `aqari-flutter`

### 2.1 Theme core (`lib/core/theme/`)

- `app_colors.dart`
  - Replace all values with the palette above.
  - Rename `primaryDark` → `primaryHover` (3 call sites) and remove `primaryLight` (1 call site → `primarySoft`).
  - Add constants: `secondary`, `onSecondary`, `primarySoftLight/Dark`, `accentTextLight/Dark`, `errorDark`, `errorSoftLight/Dark`, `successDark`, `successSoftLight/Dark`, `warningDark`, `infoDark`.
  - `AppPalette`: replace the inline `Color(...)` literals in `primaryTint`, `accentText`, `successSurface` and `successText` with these constants. `primaryTint` returns `primarySoft`. `successText` returns `success`/`successDark`. Add getters `secondary`, `onSecondary`, `errorSoft`.
- `app_theme.dart`: `ColorScheme.secondary = AppColors.secondary`, `onSecondary = AppColors.onSecondary`, `onPrimary = AppColors.onPrimary` (now white). Button, chip, input-focus and nav-bar themes keep reading tokens, so they update automatically.

### 2.2 Text vs fill audit

- **Dark text on primary.** Wherever a widget has a `primary` background and its text or icon color is `textPrimary`, `textPrimaryLight`, `Color(0xFF222222)` or `black`, change the foreground to `AppColors.onPrimary`.
- **Primary as small text.** Among the 142 `color: AppColors.primary` uses, any small (≤ 14sp) regular-weight `TextStyle` changes to `context.appColors.accentText`. Icons, bold headings and large prices stay `primary`.

### 2.3 Hardcoded colors (12 files)

| File | Change |
|---|---|
| `features/wallet/domain/wallet.dart` | unknown→`textSecondaryLight`; topUp, refund→`success`; promotion→`primary`; subscription (purple)→`warning`; booking→`info` |
| `features/notifications/presentation/providers/notifications_provider.dart` | message, searchAlert→`primary`; booking→`info`; listingApproved, payment→`success`; listingRejected→`error`; system→`textSecondaryLight` |
| `features/notifications/presentation/screens/notifications_screen.dart:164` | `#FFF8EC` → `context.appColors.primaryTint` |
| `features/wallet/presentation/screens/wallet_screen.dart:294`, `features/account/presentation/screens/account_screen.dart:646` | Navy gradient `#1A1A2E→#16213E` → `#3A251C→#1A1512` (new `AppColors.cardGradientStart/End`) |
| `features/map/presentation/widgets/map_view.dart` | `#222222`→`AppColors.textPrimaryLight`; `primaryDark`→`primaryHover`; black alpha shadows unchanged |
| `features/map/presentation/widgets/map_toggle_button.dart` | `#1A1A1A`→`AppColors.textPrimaryLight`; shadow unchanged |
| `features/{property,project,rental}_details/.../*_screen.dart` | Placeholder map tiles: `#D6EAD6`→`#EADFD3`, `#C0DCC0`→`#DCCBBB` (new `AppColors.mapPlaceholderBg/Line`) |
| `features/add_listing/presentation/steps/step6_location.dart` | `#E8F0E0`→`mapPlaceholderBg`, `#F5F5F0`→`#F8F2EC`, `#D4C9B0`→`#D9C6B2`, `#FFFFFF`→`AppColors.white` |
| `features/auth/presentation/screens/login_screen.dart:230` | Google `#4285F4` — unchanged |
| `features/property_details/.../property_details_screen.dart:983` | WhatsApp `#25D366` — unchanged |

### 2.4 Verification

- `flutter analyze` reports no new issues; `flutter test` passes.
- New `test/core/theme/app_colors_test.dart` asserts: `primary == 0xFFB5603F`, `secondary == 0xFFE0A87E`, `onPrimary == white`, `backgroundLight == 0xFFFCF8F4`, and contrast(`onPrimary`, `primary`) ≥ 4.4.
- `grep -rn "Color(0x" lib | grep -v core/theme` returns only the Google, WhatsApp and black-alpha shadow lines.
- The user does a manual visual pass in light and dark mode on: home, property details, add listing, wallet, map, chat, account.

## 3. Web — `aqari-web-finaly`

### 3.1 Tokens (`src/app/globals.css`)

- In `@theme`: remove `--color-brand`, `--color-brand-dark`, `--color-text-primary`, `--color-text-secondary` and `--color-surface` (none are used).
- Add `--color-{primary, primary-hover, on-primary, accent-text, secondary, on-secondary, primary-soft, canvas, surface, card, line, ink, muted, hint, error, error-soft, success, success-soft, warning, info}` with the Light values.
- `body`: `color: var(--color-ink); background: var(--color-canvas);`.

### 3.2 Codemod (scratchpad script, not committed)

Rewrites `className` color utilities in `src/**/*.{ts,tsx}`. Every variant prefix (`hover:`, `focus:`, `group-hover:` …) and opacity suffix (`/20`) is preserved.

| From | To |
|---|---|
| `[#F5A623]` | `primary` |
| `bg/border/ring-[#E09400]` | `primary-hover` |
| `text-[#E09400]` | `accent-text` |
| `[#222222]`, `[#111111]`, `[#444444]` | `ink` |
| `[#717171]` | `muted` |
| `bg-[#F9F9F9]`, `bg-gray-50`, `bg-gray-100` | `bg-surface` |
| `bg-gray-200` | `bg-line` |
| `border-gray-{100,200,300}`, `divide-gray-*` | `line` |
| `text-gray-{300,400}` | `text-hint` |
| `text-gray-{500,600,700}` | `text-muted` |
| `text-gray-{800,900}` | `text-ink` |
| `bg-orange-50`, `bg-amber-50`, `bg-[#FFF8EC]` | `bg-primary-soft` |
| `border-orange-100`, `border-amber-100` | `border-secondary/40` |
| `text-orange-600` | `text-accent-text` |
| `text-red-{400,500,600}`, `bg-red-500` | `error` |
| `bg-red-{50,100}`, `border-red-*` | `error-soft` / `error/30` |
| `text-{green,emerald}-{500,600,700}`, `[#11998E]`, `[#22C55E]`, `[#16A34A]` | `success` |
| `bg-{green,emerald}-{50,100}`, `border-green-200` | `success-soft` / `success/30` |
| `bg-blue-50` / `text-blue-700` | `info/10` / `info` |

The script prints every remaining color utility it did not map. Each one is resolved by
hand. WhatsApp `#25D366` / `#1ebe5d` stay.

### 3.3 Manual fixes

- **Dark text on primary.** For every element with `bg-primary` and `text-ink` or `text-black` (or no text color, so it inherits `ink`), set `text-on-primary`. Review every `bg-primary` hit.
- **Primary as small text.** `text-primary` on small (`text-xs`/`text-sm`) non-bold text → `text-accent-text`.
- `src/app/[locale]/account/wallet/page.tsx:228`: gradient → `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)`.
- `src/app/[locale]/add-listing/steps/Step6Location.tsx:83`: map pin `background:#F5A623` → `background:var(--color-primary)`.

### 3.4 Verification

- `npm run lint`, `npm test` and `npm run build` pass.
- These greps over `src/` return nothing (except WhatsApp): `#F5A623|#E09400|#222222|#717171|#F9F9F9|#FFF8EC|#11998E` and `(gray|orange|amber)-[0-9]`.
- Dev server visual pass in Arabic (RTL) and English: home, listing details, search, add listing, wallet, auth, account.

## 4. Order and commits

1. Mobile, committed on `main` in `aqari-flutter`.
2. Web, committed on `main` in `aqari-web-finaly`.

Each app is committed on its own. Nothing is pushed unless the user asks.
