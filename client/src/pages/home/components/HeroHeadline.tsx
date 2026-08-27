import type { CustomerTab } from '../home.types';

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
  personalSubtitle,
  businessTitle1,
  businessTitle2,
  businessSubtitle,
}: HeroHeadlineProps) => {
  const isPersonal = activeTab === 'personal';

  return (
    <hgroup className="space-y-3">
      <h1 className="max-w-[14ch] text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] font-medium leading-[1.08] text-(--ink)">
        {isPersonal ? personalTitle1 : businessTitle1}
        <br />
        {isPersonal ? personalTitle2 : businessTitle2} in Kigali.
      </h1>
      <p className="max-w-[46ch] text-base leading-[1.6] text-(--muted)">
        {isPersonal ? personalSubtitle : businessSubtitle}
      </p>
    </hgroup>
  );
};

export default HeroHeadline;
