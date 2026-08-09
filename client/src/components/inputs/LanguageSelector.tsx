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
        className="inline-flex items-center cursor-pointer justify-between gap-1 px-2 py-1 text-[12px] font-light text-slate-900 uppercase transition-all duration-200 hover:border-primary-900/20 hover:text-primary-900"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <span className='flex items-center gap-1 text-slate-900 text-[12px] font-light uppercase'>{currentOption?.shortLabel}</span>
      </Link>

      {isOpen && (
        <div
          className={cn(
            `absolute ${dropdownDirection === 'up' ? 'bottom-full' : 'top-full'} right-[-10px] z-[10001] mt-2 w-[52px] overflow-hidden bg-[var(--peekaboo-surface)] p-0.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.2)] backdrop-blur-sm`,
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
                className={`cursor-pointer ${isActive ? 'text-primary-900' : 'text-slate-500 hover:bg-[var(--peekaboo-surface)] hover:text-primary-900'} flex w-full items-center justify-center rounded-md px-2 py-1 text-[12px] font-light uppercase transition-colors duration-150`}
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
