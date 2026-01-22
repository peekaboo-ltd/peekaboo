import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type OrderStatusTab = 'all' | 'recent' | 'pending' | 'active' | 'completed';

export default function OrderStatusTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: OrderStatusTab;
  onTabChange: (tab: OrderStatusTab) => void;
}) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as OrderStatusTab)}>
      <TabsList className="w-full flex-wrap">
        <TabsTrigger className='cursor-pointer' value="all">All</TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="recent">Recent</TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="pending">Pending</TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="active">Active</TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="completed">Completed</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

