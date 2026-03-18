import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faUserTie } from '@fortawesome/free-solid-svg-icons';
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
    className="flex items-center gap-0 border-b border-primary-200 w-fit bg-white/40 backdrop-blur rounded-lg"
    role="tablist"
  >
    <button
      onClick={() => onTabChange('personal')}
      role="tab"
      aria-selected={activeTab === 'personal'}
      className={`flex items-center gap-2 px-4 py-2.5 text-[13px] uppercase tracking-[0.06em] font-medium transition-colors duration-200 cursor-pointer border-b-2 -mb-px rounded-t-lg ${
        activeTab === 'personal'
          ? 'border-primary-900 text-primary-900 bg-secondary-50 shadow-[0_10px_30px_rgba(37,52,63,0.08)]'
          : 'border-transparent text-primary-400 hover:text-primary-700 hover:bg-primary-900/5'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200/70`}
    >
      <FontAwesomeIcon icon={faStore} className="text-[10px]" />
      {personalLabel}
    </button>
    <button
      onClick={() => onTabChange('business')}
      role="tab"
      aria-selected={activeTab === 'business'}
      className={`flex items-center gap-2 px-4 py-2.5 text-[13px] uppercase tracking-[0.06em] font-medium transition-colors duration-200 cursor-pointer border-b-2 -mb-px rounded-t-lg ${
        activeTab === 'business'
          ? 'border-primary-900 text-primary-900 bg-secondary-50 shadow-[0_10px_30px_rgba(37,52,63,0.08)]'
          : 'border-transparent text-primary-400 hover:text-primary-700 hover:bg-primary-900/5'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200/70`}
    >
      <FontAwesomeIcon icon={faUserTie} className="text-[10px]" />
      {businessLabel}
    </button>
  </nav>
);

export default HeroTabs;
