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
    className="inline-flex w-fit items-center rounded-full border border-[#ececea] bg-white p-1 text-[12px] font-normal shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
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
          : 'text-[#6b6f76] hover:bg-[#f7f6f1] hover:text-[#0a0a0a]'
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
          : 'text-[#6b6f76] hover:bg-[#f7f6f1] hover:text-[#0a0a0a]'
      }`}
    >
      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
      {businessLabel}
    </button>
  </nav>
);

export default HeroTabs;
