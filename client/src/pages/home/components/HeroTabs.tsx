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
  <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit" role="tablist">
    <button
      onClick={() => onTabChange('personal')}
      role="tab"
      aria-selected={activeTab === 'personal'}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-normal transition-all duration-200 cursor-pointer ${
        activeTab === 'personal'
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <FontAwesomeIcon icon={faStore} className="text-xs" />
      {personalLabel}
    </button>
    <button
      onClick={() => onTabChange('business')}
      role="tab"
      aria-selected={activeTab === 'business'}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-normal transition-all duration-200 cursor-pointer ${
        activeTab === 'business'
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <FontAwesomeIcon icon={faUserTie} className="text-xs" />
      {businessLabel}
    </button>
  </nav>
);

export default HeroTabs;
