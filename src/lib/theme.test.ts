import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
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
