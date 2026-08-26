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
    <hgroup className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">
        {isPersonal
          ? 'Same-day delivery in Kigali'
          : 'Delivery built for Kigali teams'}
      </p>
      <h1 className="max-w-[12ch] text-[clamp(2.5rem,1.6rem+3.6vw,3.75rem)] font-medium leading-[1.06] tracking-[-0.03em] text-[--ink]">
        {isPersonal ? personalTitle1 : businessTitle1}
        <br />
        {isPersonal ? personalTitle2 : businessTitle2} in Kigali.
      </h1>
      <p className="max-w-[46ch] text-base font-normal leading-[1.6] text-[--muted]">
        {isPersonal ? personalSubtitle : businessSubtitle}
      </p>
    </hgroup>
  );
};

export default HeroHeadline;
