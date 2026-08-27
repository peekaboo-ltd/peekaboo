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
      <h1 className="type-display max-w-[14ch] text-(--ink)">
        {isPersonal ? personalTitle1 : businessTitle1}
        <br />
        {isPersonal ? personalTitle2 : businessTitle2} in Kigali.
      </h1>
      <p className="type-body max-w-[46ch] text-(--muted)">
        {isPersonal ? personalSubtitle : businessSubtitle}
      </p>
    </hgroup>
  );
};

export default HeroHeadline;
