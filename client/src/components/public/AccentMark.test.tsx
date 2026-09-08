import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AccentMarked from './AccentMark';

describe('AccentMarked', () => {
  it('marks the *…* segment and leaves the rest untouched', () => {
    const { container } = render(<AccentMarked text="Ready to *send a package*?" />);
    const marked = container.querySelectorAll('.mark-accent');
    expect(marked).toHaveLength(1);
    expect(marked[0]?.textContent).toBe('send a package');
    expect(container.textContent).toBe('Ready to send a package?');
  });

  it('renders copy without a paired marker verbatim', () => {
    const { container } = render(
      <AccentMarked text="Move something across Kigali." />,
    );
    expect(container.querySelector('.mark-accent')).toBeNull();
    expect(container.textContent).toBe('Move something across Kigali.');
  });

  it('ignores an unpaired asterisk instead of dropping copy', () => {
    const { container } = render(<AccentMarked text="Send anything*," />);
    expect(container.querySelector('.mark-accent')).toBeNull();
    expect(container.textContent).toBe('Send anything*,');
  });

  it('never applies the solid accent as a text color', () => {
    const { container } = render(<AccentMarked text="Ready to *send* now" />);
    const marked = container.querySelector('.mark-accent');
    expect(marked).not.toBeNull();
    // Emphasis is a background wash behind inherited ink — no accent text class.
    expect(marked?.className).not.toMatch(/text-\(--brand-accent\)/);
  });
});
