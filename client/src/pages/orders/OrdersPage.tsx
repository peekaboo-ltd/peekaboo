import Table from '@/components/table/Table';
import { useOrdersColumns } from '@/hooks/orders/columns.orders';
import { useFetchOrders } from '@/hooks/orders/orders.hooks';
import { useAppSelector } from '@/states/hooks';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import OrderSearchBar from '@/components/dashboard/OrderSearchBar';
import OrderStatusTabs, { type OrderStatusTab } from '@/components/dashboard/OrderStatusTabs';

const OrdersPage = () => {

    // STATE VARIABLES
    const { ordersList } = useAppSelector((state) => state.order);

    const { fetchOrders, page, setPage, size, setSize, totalPages, totalCount, isFetching } = useFetchOrders();

    const [searchParams, setSearchParams] = useSearchParams();

    const statusGroup = (searchParams.get('statusGroup') || '') as OrderStatusTab | '';
    const activeTab: OrderStatusTab = (['recent', 'pending', 'active', 'completed'].includes(statusGroup) ? statusGroup : 'all') as OrderStatusTab;
    const referenceId = searchParams.get('referenceId') || '';

    useEffect(() => {
        fetchOrders({
          page,
          size,
          statusGroup: activeTab === 'all' ? undefined : (activeTab as any),
          referenceId: referenceId || undefined,
        });
    }, [fetchOrders, page, size, activeTab, referenceId]);

    const { ordersColumns } = useOrdersColumns();

    const onTabChange = (tab: OrderStatusTab) => {
      const next = new URLSearchParams(searchParams);
      if (tab === 'all') next.delete('statusGroup');
      else next.set('statusGroup', tab);
      // keep referenceId if present
      setSearchParams(next);
      setPage(0);
    };

    const searchInitial = useMemo(() => referenceId, [referenceId]);

    return (
        <main className='text-primary h-full w-full'>
            <header className="w-full flex flex-col gap-4 mb-4">
              <section className="flex items-start justify-between gap-4 flex-wrap">
                <article>
                  <h1 className="text-2xl font-bold">Orders</h1>
                  <p className="text-sm text-muted-foreground">
                    Search and filter orders by status or Order ID.
                  </p>
                </article>
                <OrderSearchBar
                  initialValue={searchInitial}
                  onSearch={(query) => {
                    const next = new URLSearchParams(searchParams);
                    next.set('referenceId', query);
                    setSearchParams(next);
                    setPage(0);
                  }}
                />
              </section>

              <nav aria-label="Order status filters">
                <OrderStatusTabs activeTab={activeTab} onTabChange={onTabChange} />
              </nav>
            </header>

            <section aria-label="Orders list" className='w-full flex flex-col gap-4'>
                <Table columns={ordersColumns} data={ordersList} showPagination={true} page={page} setPage={setPage} size={size} setSize={setSize} totalPages={totalPages} totalCount={totalCount} isLoading={isFetching} />
            </section>
        </main>
    )
}

export default OrdersPage;
