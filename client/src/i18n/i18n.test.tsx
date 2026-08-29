import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { I18nProvider, useI18n } from './i18n';
import { messages } from './messages';

const LanguageHarness = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <div>
      <output>{language}</output>
      <p>{t('home.hero.badgeWithCount', { count: 25 })}</p>
      <button type="button" onClick={() => setLanguage('fr')}>
        French
      </button>
    </div>
  );
};

describe('I18nProvider', () => {
  it('interpolates copy, persists language changes, and updates the document language', async () => {
    window.localStorage.setItem('language', 'en');
    const user = userEvent.setup();

    render(
      <I18nProvider messages={messages}>
        <LanguageHarness />
      </I18nProvider>,
    );

    expect(screen.getByText('Trusted by 25+ customers in Kigali')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');

    await user.click(screen.getByRole('button', { name: 'French' }));

    expect(document.documentElement.lang).toBe('fr');
    expect(window.localStorage.getItem('language')).toBe('fr');
    expect(screen.getByText('Adopté par plus de 25 clients à Kigali')).toBeInTheDocument();
  });

  it('falls back to English when the active locale is missing a key', () => {
    window.localStorage.setItem('language', 'fr');
    const incompleteMessages = {
      en: { greeting: 'Hello, {name}' },
      fr: {},
      rw: {},
    };

    const Harness = () => <p>{useI18n().t('greeting', { name: 'Aline' })}</p>;
    render(
      <I18nProvider messages={incompleteMessages}>
        <Harness />
      </I18nProvider>,
    );

    expect(screen.getByText('Hello, Aline')).toBeInTheDocument();
  });
});
