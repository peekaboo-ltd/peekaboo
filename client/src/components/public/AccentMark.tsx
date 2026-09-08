import { Fragment } from 'react';

/**
 * Renders `*…*` segments of a copy string inside the accent marker, leaving
 * everything else untouched. Copy without a paired `*` renders verbatim, so
 * titles that do not opt in are unaffected. Which words get marked is chosen
 * per locale in the i18n strings, keeping emphasis grammatical in EN/FR/RW.
 */
const AccentMarked = ({ text }: { text: string }) => {
  const parts = text.split('*');
  if (parts.length < 3) return <>{text}</>;

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="mark-accent">
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
};

export default AccentMarked;
