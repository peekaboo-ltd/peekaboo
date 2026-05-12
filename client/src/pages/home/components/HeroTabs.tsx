import { Building2, UserRound } from 'lucide-react';
import type { CustomerTab } from '../home.types';

interface HeroTabsProps {
  activeTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
  personalLabel: string;
  businessLabel: string;
}

const HeroTabs = ({
  activeTab,
  onTabChange,
  personalLabel,
  businessLabel,
}: HeroTabsProps) => (
  <nav
    className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.06] p-1 text-[12px] font-normal"
    role="tablist"
    aria-label="Delivery audience"
  >
    <button
      type="button"
      onClick={() => onTabChange('personal')}
      role="tab"
      aria-selected={activeTab === 'personal'}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 transition ${
        activeTab === 'personal'
          ? 'bg-[#ffc400] text-[#0a0a0a]'
          : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
      }`}
    >
      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
      {personalLabel}
    </button>
    <button
      type="button"
      onClick={() => onTabChange('business')}
      role="tab"
      aria-selected={activeTab === 'business'}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 transition ${
        activeTab === 'business'
          ? 'bg-[#ffc400] text-[#0a0a0a]'
          : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
      }`}
    >
      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
      {businessLabel}
    </button>
  </nav>
);

export default HeroTabs;
