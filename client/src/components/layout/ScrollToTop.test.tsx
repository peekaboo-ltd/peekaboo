import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

const Harness = () => {
  const navigate = useNavigate();
  return (
    <>
      <ScrollToTop />
      <button onClick={() => navigate('/second')}>go second</button>
      <button onClick={() => navigate('/?tab=2')}>go query</button>
      <button onClick={() => navigate('/#section')}>go hash</button>
      <Routes>
        <Route path="/" element={<div>home</div>} />
        <Route path="/second" element={<div>second</div>} />
      </Routes>
      <div id="section">section</div>
    </>
  );
};

const renderHarness = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Harness />
    </MemoryRouter>,
  );

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('starts at the top on first render', () => {
    renderHarness();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('resets to the top when navigating to a new page', () => {
    renderHarness();
    document.documentElement.scrollTop = 500;
    fireEvent.click(screen.getByRole('button', { name: 'go second' }));
    expect(screen.getByText('second')).toBeInTheDocument();
    expect(document.documentElement.scrollTop).toBe(0);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('keeps the scroll offset on query-only changes', () => {
    renderHarness();
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'go query' }));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to the anchor instead of the top for hash links', () => {
    renderHarness();
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'go hash' }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
