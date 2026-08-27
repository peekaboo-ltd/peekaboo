import { useEffect, useRef, useState } from 'react';
import { useI18n, type Language } from '@/i18n/i18n';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const languageOptions: Record<Language, { label: string; shortLabel: string }> = {
  en: { label: 'English', shortLabel: 'EN' },
  fr: { label: 'Francais', shortLabel: 'FR' },
  rw: { label: 'Kinyarwanda', shortLabel: 'RW' },
};

interface LanguageSelectorProps {
  className?: string;
  menuClassName?: string;
  dropdownDirection?: 'up' | 'down';
}

const LanguageSelector = ({ className, menuClassName, dropdownDirection = 'down' }: LanguageSelectorProps) => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const currentOption = languageOptions[language];

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex items-center cursor-pointer justify-between gap-1 px-2 py-1 text-[12px] font-light text-(--ink) uppercase transition-[background-color,color,border-color,box-shadow] duration-200 hover:border-(--ink) hover:text-(--ink)"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <span className='flex items-center gap-1 text-(--ink) text-[12px] font-light uppercase'>{currentOption?.shortLabel}</span>
      </Link>

      {isOpen && (
        <div
          className={cn(
            `absolute ${dropdownDirection === 'up' ? 'bottom-full' : 'top-full'} right-[-10px] z-[10001] mt-2 w-[52px] overflow-hidden rounded-(--radius-control) bg-(--surface) p-0.5 shadow-[var(--shadow-menu)]`,
            menuClassName
          )}
          role="listbox"
          aria-label="Language options"
        >
          {Object.entries(languageOptions).map(([code, option]) => {
            const isActive = code === language;

            return (
              <Link
                key={code}
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLanguage(code as Language);
                  setIsOpen(false);
                }}
                className={`cursor-pointer ${isActive ? 'text-(--ink)' : 'text-(--muted) hover:bg-[var(--surface)] hover:text-(--ink)'} flex w-full items-center justify-center rounded-md px-2 py-1 text-[12px] font-light uppercase transition-colors duration-100`}
                role="option"
                aria-selected={isActive}
                title={option.label}
              >
                {option?.shortLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
