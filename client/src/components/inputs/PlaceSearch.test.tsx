import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlaceSearch from './PlaceSearch';
import { ENVIRONMENTS } from '@/constants/environments.constants';
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

describe('PlaceSearch with Mapbox Search Box', () => {
  const originalToken = ENVIRONMENTS.MAPBOX_ACCESS_TOKEN;

  beforeEach(() => {
    ENVIRONMENTS.MAPBOX_ACCESS_TOKEN = 'pk.test';
  });

  afterEach(() => {
    ENVIRONMENTS.MAPBOX_ACCESS_TOKEN = originalToken;
    vi.unstubAllGlobals();
  });

  it('suggests places and returns the retrieved coordinates in one session', async () => {
    const user = userEvent.setup();
    const onLocationSelect = vi.fn();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/suggest')) {
        return Response.json({
          suggestions: [
            {
              mapbox_id: 'poi.123',
              name: 'Kigali Convention Centre',
              place_formatted: 'KG 2 Roundabout, Kigali, Rwanda',
            },
          ],
        });
      }
      return Response.json({
        features: [
          {
            geometry: { coordinates: [30.0937, -1.9536] },
            properties: {
              mapbox_id: 'poi.123',
              name: 'Kigali Convention Centre',
              feature_type: 'poi',
              full_address: 'KG 2 Roundabout, Kigali, Rwanda',
              coordinates: { latitude: -1.9536, longitude: 30.0937 },
            },
          },
        ],
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithI18n(
      <PlaceSearch
        onLocationSelect={onLocationSelect}
        placeholder="Pickup"
        country="RW"
      />,
    );

    await user.type(screen.getByPlaceholderText('Pickup'), 'Kigali conv');
    const option = await screen.findByRole('option', {
      name: /kigali convention centre/i,
    });
    await user.click(option);

    await waitFor(() =>
      expect(onLocationSelect).toHaveBeenCalledWith({
        coordinates: { latitude: -1.9536, longitude: 30.0937 },
        formattedAddress: 'KG 2 Roundabout, Kigali, Rwanda',
        name: 'Kigali Convention Centre',
        placeId: 'poi.123',
      }),
    );

    const urls = fetchMock.mock.calls.map(([input]) => new URL(String(input)));
    const suggest = urls.find((url) => url.pathname.endsWith('/suggest'));
    const retrieve = urls.find((url) => url.pathname.includes('/retrieve/'));
    expect(suggest?.searchParams.get('country')).toBe('rw');
    expect(retrieve?.searchParams.get('session_token')).toBe(
      suggest?.searchParams.get('session_token'),
    );
  });

  it('shows skeleton rows while suggestions are loading', async () => {
    const user = userEvent.setup();
    let respond: (response: Response) => void = () => undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>((resolve) => { respond = resolve; })),
    );

    renderWithI18n(
      <PlaceSearch onLocationSelect={vi.fn()} placeholder="Pickup" />,
    );

    await user.type(screen.getByPlaceholderText('Pickup'), 'Kim');
    expect(screen.getByRole('status')).toHaveTextContent(
      messages.en['common.searchingPlaces'],
    );
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    respond(
      Response.json({
        suggestions: [
          { mapbox_id: 'place.1', name: 'Kimihurura', place_formatted: 'Kigali, Rwanda' },
        ],
      }),
    );

    expect(
      await screen.findByRole('option', { name: /kimihurura/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error when search is unavailable', async () => {
    const user = userEvent.setup();
    ENVIRONMENTS.MAPBOX_ACCESS_TOKEN = '';

    renderWithI18n(
      <PlaceSearch onLocationSelect={vi.fn()} placeholder="Pickup" />,
    );

    await user.type(screen.getByPlaceholderText('Pickup'), 'Kimihurura');
    expect(await screen.findByText(messages.en['common.mapsLoadFailed'])).toBeInTheDocument();
  });
});
