import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  GoogleGIcon,
  InstagramIcon,
  MastercardIcon,
  TikTokIcon,
  VisaIcon,
  WhatsAppIcon,
} from './brands';

const icons = {
  GoogleGIcon,
  WhatsAppIcon,
  TikTokIcon,
  InstagramIcon,
  VisaIcon,
  MastercardIcon,
};

describe.each(Object.entries(icons))('%s', (name, Icon) => {
  it('renders a decorative svg carrying the brand-icon flag', () => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.classList.contains('brand-icon')).toBe(true);
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('passes sizing classes through without custom css', () => {
    const { container } = render(<Icon className="size-4" />);
    expect(container.querySelector('svg')?.classList.contains('size-4')).toBe(true);
  });

  it('uses no hard-coded brand hex', () => {
    const { container } = render(<Icon />);
    const html = container.innerHTML.toLowerCase();
    for (const hex of [
      '#4285f4', '#34a853', '#fbbc05', '#ea4335', '#25d366',
      '#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5',
      '#25f4ee', '#fe2c55', '#1a1f71', '#eb001b', '#f79e10', '#ff5f00',
    ]) {
      expect(html, `${name} must reference tokens, not ${hex}`).not.toContain(hex);
    }
  });
});

describe('guideline colors', () => {
  it('Google G uses all four official inks', () => {
    const { container } = render(<GoogleGIcon />);
    const fills = [...container.querySelectorAll('path')].map((p) => p.style.fill);
    expect(fills).toEqual([
      'var(--brand-google-blue)',
      'var(--brand-google-green)',
      'var(--brand-google-yellow)',
      'var(--brand-google-red)',
    ]);
  });

  it('TikTok layers cyan and magenta under the note', () => {
    const { container } = render(<TikTokIcon />);
    const fills = [...container.querySelectorAll('path')].map((p) => p.style.fill);
    expect(fills).toEqual([
      'var(--brand-tiktok-magenta)',
      'var(--brand-tiktok-cyan)',
      'var(--brand-tiktok-note)',
    ]);
  });

  it('Instagram fills the glyph with the five-stop gradient', () => {
    const { container } = render(<InstagramIcon />);
    const stops = [...container.querySelectorAll('stop')].map((s) => s.style.stopColor);
    expect(stops).toEqual([
      'var(--brand-instagram-yellow)',
      'var(--brand-instagram-orange)',
      'var(--brand-instagram-pink)',
      'var(--brand-instagram-purple)',
      'var(--brand-instagram-blue)',
    ]);
    const path = container.querySelector('path');
    expect(path?.style.fill).toMatch(/^url\(#instagram-gradient-/);
  });

  it('Mastercard paints red, orange and the center lens', () => {
    const { container } = render(<MastercardIcon />);
    const fills = [
      ...[...container.querySelectorAll('circle')].map((c) => c.style.fill),
      container.querySelector('path')?.style.fill,
    ];
    expect(fills).toEqual([
      'var(--brand-mastercard-red)',
      'var(--brand-mastercard-orange)',
      'var(--brand-mastercard-center)',
    ]);
  });

  it('WhatsApp and Visa reference their single official inks', () => {
    const { container: wa } = render(<WhatsAppIcon />);
    expect(wa.querySelector('path')?.style.fill).toBe('var(--brand-whatsapp-mark)');
    const { container: visa } = render(<VisaIcon />);
    expect(visa.querySelector('path')?.style.fill).toBe('var(--brand-visa-navy)');
  });
});
