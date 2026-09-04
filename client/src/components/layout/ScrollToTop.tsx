import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets the viewport to the top whenever a new page is rendered.
// React Router swaps the route content in place, so without this the next
// page would open at the previous page's scroll offset. Only the pathname
// triggers a reset — query-only changes (filters, tabs, pagination) stay
// where the reader is, and hash links still scroll to their anchor.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    // Direct assignment jumps instantly regardless of the CSS
    // `scroll-behavior: smooth` on <html>; window.scrollTo alone would
    // animate the trip from the bottom of a long page.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
