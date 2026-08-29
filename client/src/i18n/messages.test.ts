import { describe, expect, it } from 'vitest';
import { messages } from './messages';

const placeholders = (value: string) =>
  [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g)].map((match) => match[1]).sort();

describe('translation catalog', () => {
  const englishKeys = Object.keys(messages.en).sort();

  it.each(['fr', 'rw'] as const)('%s has exactly the same keys as English', (language) => {
    expect(Object.keys(messages[language]).sort()).toEqual(englishKeys);
  });

  it.each(['en', 'fr', 'rw'] as const)('%s has no empty translations', (language) => {
    const emptyKeys = Object.entries(messages[language])
      .filter(([, value]) => value.trim().length === 0)
      .map(([key]) => key);

    expect(emptyKeys).toEqual([]);
  });

  it.each(['fr', 'rw'] as const)('%s preserves every interpolation variable', (language) => {
    const mismatches = englishKeys.filter(
      (key) =>
        placeholders(messages.en[key]).join(',') !== placeholders(messages[language][key]).join(','),
    );

    expect(mismatches).toEqual([]);
  });
});
