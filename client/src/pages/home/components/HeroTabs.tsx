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
    className="inline-flex w-fit items-center rounded-full border border-border bg-[var(--peekaboo-surface)] p-1 text-[12px] font-normal shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
    role="tablist"
    aria-label="Delivery audience"
  >
    <button
      type="button"
      onClick={() => onTabChange('personal')}
      role="tab"
      aria-selected={activeTab === 'personal'}
      className={`group relative inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 transition-all duration-300 ${
        activeTab === 'personal'
          ? 'bg-[#edb100] text-[#0a0a0a] shadow-[0_2px_8px_-2px_rgba(237,177,0,0.4)]'
          : 'text-muted-foreground group-hover:text-foreground'
      }`}
    >
      <span className="absolute inset-0 rounded-full" />
      <UserRound className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
      <span className="relative text-[12px] font-normal">{personalLabel}</span>
    </button>
    <button
      type="button"
      onClick={() => onTabChange('business')}
      role="tab"
      aria-selected={activeTab === 'business'}
      className={`group relative inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 transition-all duration-300 ${
        activeTab === 'business'
          ? 'bg-[#edb100] text-[#0a0a0a] shadow-[0_2px_8px_-2px_rgba(237,177,0,0.4)]'
          : 'text-muted-foreground group-hover:text-foreground'
      }`}
    >
      <span className="absolute inset-0 rounded-full" />
      <Building2 className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
      <span className="relative text-[12px] font-normal">{businessLabel}</span>
    </button>
  </nav>
);

export default HeroTabs;
