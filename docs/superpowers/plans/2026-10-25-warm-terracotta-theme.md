# Warm Terracotta Theme (Web) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the orange brand and grey neutrals in `aqari-web-finaly` with the warm terracotta/sand palette, using semantic Tailwind tokens instead of hardcoded hex.

**Architecture:** Tailwind v4 reads colors from `@theme` in `src/app/globals.css`. Defining `--color-primary` creates `bg-primary`, `text-primary`, `border-primary/20` and so on. We add the palette there. A throwaway codemod then rewrites every `*-[#hex]` and `gray|orange|amber|red|green|emerald|blue-N` color class in `src/` to a token class. Inline-style hex is fixed by hand. A Vitest guard test keeps legacy colors from coming back.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4 (`@tailwindcss/postcss`), Vitest 3 (node environment), next-intl (ar/en).

**Spec:** `docs/superpowers/specs/2026-10-25-warm-terracotta-theme-design.md`

## Global Constraints

- Work on `main`. Do not create branches. Commit after each task. Do not push.
- Light mode only. Do not add dark mode.
- Token values (web uses the Light column of the spec): primary `#B5603F`, primary-hover `#9A4E32`, on-primary `#FFFFFF`, accent-text `#9A4E32`, secondary `#E0A87E`, on-secondary `#2B211C`, primary-soft `#F6E8DF`, canvas `#FCF8F4`, surface `#F5EDE6`, card `#FFFFFF`, line `#EADFD6`, ink `#2B211C`, muted `#75655B`, hint `#A8988D`, error `#C2362F`, error-soft `#FBEAE8`, success `#2F7D5B`, success-soft `#EAF4EE`, warning `#C98A1E`, info `#3E7CB1`.
- Keep unchanged: WhatsApp `#25D366` / `#1ebe5d`, and `white`/`black`/`transparent` utilities. `violet|purple|indigo|yellow` classes are category/status accents not covered by the spec's mapping, so they stay as they are.
- Rule: `text-primary` is for icons, bold text and large text. Small (`text-xs`/`text-sm`) non-bold colored text uses `text-accent-text`. Text on `bg-primary` is `text-white` or `text-on-primary`, never `text-ink`.
- The codemod script lives in the session scratchpad and is never committed.

---

### Task 1: Palette tokens

**Files:**
- Modify: `src/app/globals.css:4-24`
- Test: `src/lib/theme.test.ts` (create)

**Interfaces:**
- Produces: Tailwind color tokens `primary, primary-hover, on-primary, accent-text, secondary, on-secondary, primary-soft, canvas, surface, card, line, ink, muted, hint, error, error-soft, success, success-soft, warning, info`. As CSS variables, they are `var(--color-<name>)`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/theme.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(process.cwd(), 'src');

describe('warm terracotta theme tokens', () => {
  const css = readFileSync(resolve(SRC, 'app/globals.css'), 'utf8');

  it('defines the palette in @theme', () => {
    for (const decl of [
      '--color-primary: #B5603F;',
      '--color-primary-hover: #9A4E32;',
      '--color-on-primary: #FFFFFF;',
      '--color-accent-text: #9A4E32;',
      '--color-secondary: #E0A87E;',
      '--color-primary-soft: #F6E8DF;',
      '--color-canvas: #FCF8F4;',
      '--color-ink: #2B211C;',
      '--color-muted: #75655B;',
      '--color-line: #EADFD6;',
    ]) {
      expect(css).toContain(decl);
    }
  });

  it('drops the unused legacy tokens and paints the body warm', () => {
    expect(css).not.toMatch(/--color-brand|--color-text-primary|--color-text-secondary/);
    expect(css).toMatch(/background:\s*var\(--color-canvas\)/);
    expect(css).toMatch(/color:\s*var\(--color-ink\)/);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: FAIL (`--color-primary: #B5603F;` not found).

- [ ] **Step 3: Replace the `@theme` block and `body` colors in `src/app/globals.css`**

```css
@theme {
  --color-primary: #B5603F;
  --color-primary-hover: #9A4E32;
  --color-on-primary: #FFFFFF;
  --color-accent-text: #9A4E32;
  --color-secondary: #E0A87E;
  --color-on-secondary: #2B211C;
  --color-primary-soft: #F6E8DF;
  --color-canvas: #FCF8F4;
  --color-surface: #F5EDE6;
  --color-card: #FFFFFF;
  --color-line: #EADFD6;
  --color-ink: #2B211C;
  --color-muted: #75655B;
  --color-hint: #A8988D;
  --color-error: #C2362F;
  --color-error-soft: #FBEAE8;
  --color-success: #2F7D5B;
  --color-success-soft: #EAF4EE;
  --color-warning: #C98A1E;
  --color-info: #3E7CB1;
}
```

And in `body`:

```css
body {
  font-family: 'Cairo', Arial, sans-serif;
  color: var(--color-ink);
  background: var(--color-canvas);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/lib/theme.test.ts
git commit -m "feat(theme): add warm terracotta palette tokens"
```

---

### Task 2: Codemod all color classes onto tokens

**Files:**
- Create (scratchpad, not committed): `$SCRATCH/theme-codemod.mjs`, where `$SCRATCH` is the session scratchpad directory
- Modify: about 63+ files under `src/` (whatever the codemod touches)
- Modify: `src/app/[locale]/account/wallet/page.tsx:228`, `src/app/[locale]/add-listing/steps/Step6Location.tsx:83`
- Test: `src/lib/theme.test.ts` (extend)

**Interfaces:**
- Consumes: the tokens from Task 1.
- Produces: no new APIs.

- [ ] **Step 1: Add the failing legacy-color guard**

Append to `src/lib/theme.test.ts` (merge the extra imports into the existing import lines):

```ts
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.ts$/.test(name) ? [full] : [];
  });
}

const LEGACY_HEX = /#(F5A623|E09400|222222|717171|F9F9F9|FFF8EC|11998E|111111|444444|22C55E|16A34A)\b/i;
const LEGACY_UTILITY = /\b(gray|orange|amber|red|green|emerald|blue)-\d{2,3}\b/;

describe('no legacy colors in src', () => {
  it('uses tokens instead of old hex values and palette utilities', () => {
    const offenders = walk(SRC).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, i) =>
          LEGACY_HEX.test(line) || LEGACY_UTILITY.test(line)
            ? [`${relative(SRC, file)}:${i + 1}: ${line.trim()}`]
            : [],
        ),
    );
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: the legacy guard FAILS with hundreds of offender lines; the token tests pass.

- [ ] **Step 3: Write the codemod** at `$SCRATCH/theme-codemod.mjs`

```js
// Usage: node theme-codemod.mjs <srcDir> [--write]
// Rewrites Tailwind color classes to the warm terracotta tokens.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const srcDir = process.argv[2];
const write = process.argv.includes('--write');
if (!srcDir) throw new Error('usage: node theme-codemod.mjs <srcDir> [--write]');

const UTIL = '(bg|text|border(?:-[trblxyse])?|ring|divide|placeholder|from|to|via|fill|stroke|outline|accent|shadow|decoration|caret)';
const COLOR = '(\\[#[0-9A-Fa-f]{6}\\]|(?:gray|orange|amber|red|green|emerald|blue)-\\d{2,3})';
const RE = new RegExp(`(?<![\\w\\[-])${UTIL}-${COLOR}(/\\d+)?(?![\\w\\]-])`, 'g');

const same = (token) => ({ '*': token });
const MAP = {
  '[#F5A623]': same('primary'),
  '[#E09400]': { text: 'accent-text', '*': 'primary-hover' },
  '[#222222]': same('ink'),
  '[#111111]': same('ink'),
  '[#444444]': same('ink'),
  '[#717171]': same('muted'),
  '[#F9F9F9]': same('surface'),
  '[#FFF8EC]': same('primary-soft'),
  '[#11998E]': same('success'),
  '[#22C55E]': same('success'),
  '[#16A34A]': same('success'),
  'gray-50': same('surface'),
  'gray-100': { bg: 'surface', from: 'surface', '*': 'line' },
  'gray-200': same('line'),
  'gray-300': { text: 'hint', '*': 'line' },
  'gray-400': same('hint'),
  'gray-500': same('muted'),
  'gray-600': same('muted'),
  'gray-700': same('muted'),
  'gray-800': same('ink'),
  'gray-900': same('ink'),
  'orange-50': same('primary-soft'),
  'amber-50': same('primary-soft'),
  'orange-100': { border: 'secondary/40', '*': 'primary-soft' },
  'amber-100': { border: 'secondary/40', '*': 'primary-soft' },
  'orange-200': { border: 'secondary/60', '*': 'secondary' },
  'amber-200': { border: 'secondary/60', '*': 'secondary' },
  'amber-400': same('warning'),
  'amber-500': same('warning'),
  'orange-600': same('accent-text'),
  'orange-700': same('accent-text'),
  'orange-800': same('accent-text'),
  'amber-700': same('accent-text'),
  'amber-800': same('accent-text'),
  'amber-900': same('accent-text'),
};

const SEMANTIC = { red: 'error', green: 'success', emerald: 'success', blue: 'info' };

function semantic(color, family) {
  const [name, shadeStr] = color.split('-');
  const token = SEMANTIC[name];
  if (!token) return null;
  const shade = Number(shadeStr);
  const soft = token === 'info' ? 'info/10' : `${token}-soft`;
  if (family === 'bg') return shade <= 100 ? soft : token;
  if (family === 'border' || family === 'ring' || family === 'divide') {
    return shade <= 100 ? `${token}/20` : `${token}/30`;
  }
  return token;
}

function resolveToken(util, color) {
  const family = util.startsWith('border') ? 'border' : util;
  const key = color.startsWith('[') ? color.toUpperCase() : color;
  const entry = MAP[key];
  if (entry) return entry[family] ?? entry['*'] ?? null;
  return semantic(color, family);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(name) && !/\.test\.ts$/.test(name) ? [full] : [];
  });
}

const unmapped = new Map();
let changedFiles = 0;
let replacements = 0;

for (const file of walk(srcDir)) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(RE, (match, util, color, opacity = '') => {
    const token = resolveToken(util, color);
    if (!token) {
      unmapped.set(match, (unmapped.get(match) ?? 0) + 1);
      return match;
    }
    replacements++;
    return token.includes('/') ? `${util}-${token}` : `${util}-${token}${opacity}`;
  });
  if (after !== before) {
    changedFiles++;
    if (write) writeFileSync(file, after);
  }
}

console.log(`${write ? 'Rewrote' : 'Would rewrite'} ${replacements} classes in ${changedFiles} files.`);
const leftover = [...unmapped].filter(([m]) => !/25D366|1ebe5d/i.test(m));
if (leftover.length) {
  console.log('\nUnmapped color classes (resolve by hand):');
  for (const [m, n] of leftover.sort((a, b) => b[1] - a[1])) console.log(`  ${n}\t${m}`);
}
```

- [ ] **Step 4: Dry-run and review the report**

Run: `node $SCRATCH/theme-codemod.mjs src`
Expected: a line like `Would rewrite ~1700 classes in ~70 files.` and **no** "Unmapped" section (WhatsApp is filtered out; violet/purple/indigo/yellow are not matched at all). If unmapped classes appear, add them to `MAP` according to the spec's table and dry-run again.

- [ ] **Step 5: Apply**

Run: `node $SCRATCH/theme-codemod.mjs src --write && git diff --stat | tail -3`
Expected: the same counts, and `git diff --stat` lists the changed files.

- [ ] **Step 6: Fix the two inline-style hex values by hand**

`src/app/[locale]/account/wallet/page.tsx:228`, in the `style` prop:

```tsx
style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)' }}
```

`src/app/[locale]/add-listing/steps/Step6Location.tsx:83`, in the `innerHTML` template: replace `background:#F5A623` with `background:var(--color-primary)`.

- [ ] **Step 7: Run the guard test and confirm it passes**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: PASS (3 tests). If any offenders remain, they are hex/utility uses the codemod regex didn't match (for example classes built with string concatenation such as `` `text-${color}-500` ``). Fix each one by hand with the same mapping.

- [ ] **Step 8: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed with no new errors.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "refactor(theme): replace hardcoded colors with warm terracotta tokens"
```

---

### Task 3: Contrast audit — text on primary, small primary text

**Files:**
- Modify: whichever files the greps below surface

**Interfaces:**
- Consumes: `text-on-primary`, `text-accent-text` tokens.
- Produces: no new APIs.

- [ ] **Step 1: Find dark text on primary fills**

Run:

```bash
grep -rnE '(^|[" `])bg-primary([" `]|$)' src | grep -E 'text-(ink|black)\b'
grep -rnE '(^|[" `])bg-primary([" `]|$)' src | grep -vE 'text-(white|on-primary)\b'
```

The first list must be empty after fixes: change `text-ink`/`text-black` on those elements to `text-white`. The second list shows `bg-primary` elements with no explicit light text. Open each one. If the element contains text (button, badge, step number), add `text-white`. Purely decorative bars and dots (e.g. `h-1 w-16 bg-primary`) need nothing.

- [ ] **Step 2: Find small, non-bold primary text**

Run:

```bash
grep -rnE '(^|[" `])text-primary([" `]|$)' src | grep -E 'text-(xs|sm)\b' | grep -vE 'font-(semibold|bold|extrabold|black)\b'
```

For each hit, change `text-primary` → `text-accent-text` (only the bare `text-primary`; `hover:text-primary` stays). Text inherited from a parent `text-primary` with a small child size is caught in the visual pass in Task 4.

- [ ] **Step 3: Test, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "fix(theme): white text on terracotta fills, accent-text for small colored text"
```

---

### Task 4: Visual verification

**Files:** none (fix-ups only if issues are found)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` and open `http://localhost:3000/ar` and `http://localhost:3000/en`.

- [ ] **Step 2: Check each page in Arabic (RTL) and English**

Home, search/listings, listing details, add listing (all steps, including the map pin on the location step), auth (phone + OTP), account, wallet (gradient balance card), complaints, contact, delete-account, 404.

Check: no leftover orange or cold grey; primary buttons are terracotta with white labels and darker hover; cream page background with white cards; input focus rings are terracotta; error text is red, clearly distinct from terracotta; WhatsApp buttons are still green.

- [ ] **Step 3: Fix and commit any issues**

```bash
git add src
git commit -m "fix(theme): visual pass adjustments"
```

Skip the commit if no changes were needed.

---

## Self-Review

- Spec §3.1 → Task 1. §3.2 → Task 2 (the mapping table is encoded in `MAP` plus `semantic()`; `text-gray-300/400` → `hint` follows the spec). §3.3 → Task 2 Step 6 (inline styles) and Task 3. §3.4 → the Task 2 guard test, Task 2/3 lint and build, and Task 4.
- The spec's verification grep was `(gray|orange|amber)`. The guard is stricter (it also covers red/green/emerald/blue) because the codemod maps those too.
- Token names used in Tasks 2–3 (`on-primary`, `accent-text`, `primary-soft`, `hint`, `line`, `error-soft`, `success-soft`) are all defined in Task 1.
