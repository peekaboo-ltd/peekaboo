import { useState } from 'react';
import { Check } from 'lucide-react';
import { useI18n, type Language } from '@/i18n/i18n';
import Modal from '@/components/Modal';
import { cn } from '@/lib/utils';

const languageOptions: {
  code: Language;
  nativeName: string;
  labelKey: string;
}[] = [
  { code: 'en', nativeName: 'English', labelKey: 'home.language.en' },
  { code: 'fr', nativeName: 'Français', labelKey: 'home.language.fr' },
  { code: 'rw', nativeName: 'Ikinyarwanda', labelKey: 'home.language.rw' },
];

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = languageOptions.find((option) => option.code === language);

  const selectLanguage = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-(--radius-control) border border-transparent px-2 py-1 text-xs font-medium uppercase text-(--ink) transition-[background-color,color,border-color,box-shadow] duration-200 ease-(--ease-flat) hover:border-(--line) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]',
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={t('home.language.label')}
      >
        {currentOption?.code.toUpperCase() ?? 'EN'}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        heading={t('home.language.label')}
        description={t('home.language.description')}
        className="sm:min-w-[360px] sm:max-w-[420px]"
      >
        <ul className="grid gap-2" role="listbox" aria-label={t('home.language.label')}>
          {languageOptions.map(({ code, nativeName, labelKey }) => {
            const isActive = code === language;

            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => selectLanguage(code)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-(--radius-control) border px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200 ease-(--ease-flat)',
                    isActive
                      ? 'border-(--ink) bg-(--ink) text-(--paper)'
                      : 'border-(--line) bg-(--paper) text-(--ink) hover:border-(--line-strong) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
                  )}
                >
                  <span>
                    <span className={cn(
                      "block text-sm font-medium",
                      isActive ? "text-(--paper)" : "text-(--ink)"
                    )}>
                      {t(labelKey)}
                    </span>
                    <span className={cn(
                      "type-meta mt-0.5 block",
                      isActive ? "text-(--paper)" : ""
                    )}>{nativeName}</span>
                  </span>
                  {isActive ? (
                    <Check className="size-4 shrink-0 text-(--paper)" aria-hidden="true" />
                  ) : (
                    <span className="type-meta shrink-0 uppercase">{code}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>

    </>
  );
};

export default LanguageSelector;
