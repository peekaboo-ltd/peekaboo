import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PlaceSearch from './PlaceSearch';
import { I18nProvider } from '@/i18n/i18n';
import { messages } from '@/i18n/messages';

const renderWithI18n = (component: React.ReactNode) =>
  render(<I18nProvider messages={messages}>{component}</I18nProvider>);

describe('PlaceSearch empty option', () => {
  it('shows the option on empty focus and removes it when searching', async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <PlaceSearch
        onLocationSelect={vi.fn()}
        placeholder="Pickup"
        emptyOption={{
          label: 'Use current location',
          description: 'Set your device location as pickup',
          onSelect: vi.fn(),
        }}
      />,
    );

    const input = screen.getByPlaceholderText('Pickup');
    await user.click(input);
    expect(
      screen.getByRole('option', { name: /use current location/i }),
    ).toBeInTheDocument();

    await user.type(input, 'Ki');
    expect(
      screen.queryByRole('option', { name: /use current location/i }),
    ).not.toBeInTheDocument();
  });

  it('runs the selected action and closes the option', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderWithI18n(
      <PlaceSearch
        onLocationSelect={vi.fn()}
        placeholder="Pickup"
        emptyOption={{ label: 'Use current location', onSelect }}
      />,
    );

    await user.click(screen.getByPlaceholderText('Pickup'));
    await user.click(
      screen.getByRole('option', { name: /use current location/i }),
    );

    expect(onSelect).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole('option', { name: /use current location/i }),
    ).not.toBeInTheDocument();
  });
});
