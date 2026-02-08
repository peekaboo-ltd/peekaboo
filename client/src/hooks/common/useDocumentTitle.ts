import { useEffect } from 'react';

const BASE_TITLE = 'Peekaboo';

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
  }, [title]);
};
