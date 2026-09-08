import { Link } from 'react-router-dom';
import type { CustomerTab } from '../home.types';
import { useI18n } from '@/i18n/i18n';

interface HeroHeadlineProps {
  activeTab: CustomerTab;
  personalTitle1: string;
  personalTitle2: string;
  personalSubtitle: string;
  businessTitle1: string;
  businessTitle2: string;
  businessSubtitle: string;
}

const HeroHeadline = ({
  activeTab,
  personalTitle1,
  personalTitle2,
  businessTitle1,
  businessTitle2,
  businessSubtitle,
}: HeroHeadlineProps) => {
  const isPersonal = activeTab === 'personal';
  const { t } = useI18n();

  return (
    <hgroup className="space-y-3">
      <h1 className="type-display max-w-[14ch] text-(--ink)">
        {isPersonal
          ? (
              <>
                {personalTitle1.split('*').map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <sup className="text-2xl align-[0.1em]">
                        <Link
                          to="/legal/terms-and-conditions"
                          className="transition-all duration-200 hover:scale-150 inline-block hover:text-(--ink)"
                          style={{ display: 'inline-block' }}
                        >
                          *
                        </Link>
                   
                      </sup>
                    </span>
                  ) : (
                    part
                  )
                )}
              </>
            )
          : businessTitle1}
        <br />
        <span className="mark-accent">
          {isPersonal ? personalTitle2 : businessTitle2} {t('home.headline.kigali')}
        </span>
      </h1>
      <p className="type-body max-w-[46ch] text-(--muted)">
        {isPersonal ? <Link to="/legal/terms-and-conditions" className='underline text-sm underline-offset-2 decoration-(--brand-accent) hover:text-(--ink)'>{t('home.headline.learnMore')}</Link> : businessSubtitle}
      </p>
 
    </hgroup>
  );
};

export default HeroHeadline;
