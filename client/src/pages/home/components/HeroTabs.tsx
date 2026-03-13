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
    className="flex items-center gap-0 border-b border-gray-200 w-fit"
    role="tablist"
  >
    <button
      onClick={() => onTabChange('personal')}
      role="tab"
      aria-selected={activeTab === 'personal'}
      className={`flex items-center gap-2 px-4 py-2.5 text-[12px] uppercase tracking-[0.06em] font-normal transition-colors duration-200 cursor-pointer border-b-2 -mb-px ${
        activeTab === 'personal'
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      <FontAwesomeIcon icon={faStore} className="text-[10px]" />
      {personalLabel}
    </button>
    <button
      onClick={() => onTabChange('business')}
      role="tab"
      aria-selected={activeTab === 'business'}
      className={`flex items-center gap-2 px-4 py-2.5 text-[12px] uppercase tracking-[0.06em] font-normal transition-colors duration-200 cursor-pointer border-b-2 -mb-px ${
        activeTab === 'business'
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      <FontAwesomeIcon icon={faUserTie} className="text-[10px]" />
      {businessLabel}
    </button>
  </nav>
);

export default HeroTabs;
