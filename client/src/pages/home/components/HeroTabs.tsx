import Select from '@/components/inputs/Select';
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
    <Select
      value={activeTab}
      onChange={(value) => onTabChange(value as CustomerTab)}
      options={[
        { label: personalLabel, value: 'personal' },
        { label: businessLabel, value: 'business' },
      ]}
      className='max-w-[14rem] max-sm:max-w-full'
    />
);

export default HeroTabs;
