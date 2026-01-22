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
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="recent">Recent</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

