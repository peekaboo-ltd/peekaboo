import type { I18nContextValue } from '@/i18n/i18n';
import { PublicSectionCard } from '@/components/layout/PublicPage';

export type LegalBlock = { type: 'p' | 'ul'; keys: string[] };

export type LegalSectionDef = { titleKey: string; blocks: LegalBlock[] };

type Props = {
  sections: LegalSectionDef[];
  t: I18nContextValue['t'];
};

export const LegalPolicySections = ({ sections, t }: Props) => (
  <div className="flex flex-col gap-4">
    {sections.map((section) => (
      <PublicSectionCard key={section.titleKey} title={t(section.titleKey)}>
        <div className="flex flex-col gap-3">
          {section.blocks.map((block, blockIdx) =>
            block.type === 'p' ? (
              <div key={blockIdx} className="flex flex-col gap-3">
                {block.keys.map((key) => (
                  <p key={key} className="text-sm leading-6 text-[--muted]">
                    {t(key)}
                  </p>
                ))}
              </div>
            ) : (
              <ul
                key={blockIdx}
                className="list-disc space-y-2 pl-5 text-sm leading-6 text-[--muted]"
              >
                {block.keys.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            )
          )}
        </div>
      </PublicSectionCard>
    ))}
  </div>
);
