import Table from '@/components/table/Table';
import { useOrdersColumns } from '@/hooks/orders/columns.orders';
import { useFetchOrders } from '@/hooks/orders/orders.hooks';
import { useAppSelector } from '@/states/hooks';
import { useEffect } from 'react'

const OrdersPage = () => {

    // STATE VARIABLES
    const { ordersList } = useAppSelector((state) => state.order);

    const { fetchOrders, page, setPage, size, setSize, totalPages, totalCount, isFetching } = useFetchOrders();

    useEffect(() => {
        fetchOrders({ page, size });
    }, [fetchOrders, page, size]);

    const { ordersColumns } = useOrdersColumns();

    return (
        <main className='text-primary h-full w-full'>
            <menu className='w-full flex flex-col gap-4'>
                <Table columns={ordersColumns} data={ordersList} showPagination={true} page={page} setPage={setPage} size={size} setSize={setSize} totalPages={totalPages} totalCount={totalCount} isLoading={isFetching} />
            </menu>
        </main>
    )
}

export default OrdersPage;
