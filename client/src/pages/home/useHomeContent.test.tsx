import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHomeContent } from './useHomeContent';
import { WhatsAppIcon } from '@/components/icons/brands';
import { I18nProvider } from '@/i18n/i18n';
import { messages } from '@/i18n/messages';

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider messages={messages}>{children}</I18nProvider>
);

describe('supportContacts WhatsApp row', () => {
  it('uses the official WhatsApp icon for +250 794 892 784', () => {
    const { result } = renderHook(() => useHomeContent(), { wrapper });
    const whatsapp = result.current.supportContacts.find(
      (contact) => contact.subtitle === '+250 794 892 784' && contact.external,
    );
    expect(whatsapp).toBeDefined();
    expect(whatsapp?.icon).toBe(WhatsAppIcon);
    expect(whatsapp?.href).toBe(
      'https://wa.me/250794892784?text=Hello%2C%20I%20need%20help%20with%20Peekaboo',
    );
  });

  it('keeps the ~90s response badge', () => {
    const { result } = renderHook(() => useHomeContent(), { wrapper });
    const whatsapp = result.current.supportContacts.find(
      (contact) => contact.subtitle === '+250 794 892 784' && contact.external,
    );
    expect(whatsapp?.badge).toBe('~90s');
  });
});
