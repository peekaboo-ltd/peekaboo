import { useI18n, type Language } from '@/i18n/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const languageOptions: Record<Language, { flag: string; label: string }> = {
  en: { flag: '🇬🇧', label: 'En' },
  fr: { flag: '🇫🇷', label: 'Fr' },
  rw: { flag: '🇷🇼', label: 'Kiny' },
};

const LanguageSelector = () => {
  const { language, setLanguage } = useI18n();

  const currentOption = languageOptions[language];

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger className="cursor-pointer w-fit min-w-[80px]">
        <SelectValue>
          <span className="flex items-center gap-2 !text-[12px]">
            {currentOption.flag} {currentOption.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[10001]">
        {Object.entries(languageOptions).map(([code, option]) => (
          <SelectItem key={code} value={code} className="cursor-pointer">
            <span className="flex items-center gap-2 !text-[12px]">
              {option.flag} {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
