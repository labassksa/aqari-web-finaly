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
