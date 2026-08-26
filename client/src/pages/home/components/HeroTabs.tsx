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
    className="inline-flex h-11 w-fit items-center rounded-[--radius-pill] bg-[--surface] p-1"
    role="tablist"
    aria-label="Delivery audience"
  >
    {([
      ['personal', personalLabel],
      ['business', businessLabel],
    ] as const).map(([tab, label]) => (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        role="tab"
        aria-selected={activeTab === tab}
        className="h-9 rounded-[--radius-pill] px-4 text-sm font-medium text-[--muted] outline-none transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] aria-selected:bg-[--ink] aria-selected:text-[--paper] active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
      >
        {label}
      </button>
    ))}
  </nav>
);

export default HeroTabs;
