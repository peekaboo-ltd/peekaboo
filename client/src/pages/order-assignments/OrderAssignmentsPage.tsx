import Table from '@/components/table/Table';
import { useOrderAssignmentsColumns } from '@/hooks/orders/columns.orderAssignments';
import { useFetchOrderAssignments } from '@/hooks/orders/orderAssignments.hooks';
import { useAppSelector } from '@/states/hooks';
import { useEffect } from 'react'
import AcceptOrderAssignment from './AcceptOrderAssignment';
import RejectOrderAssignment from './RejectOrderAssignment';
import ReassignOrderAssignment from './ReassignOrderAssignment';
import { UUID } from '@/types';

const OrderAssignmentsPage = () => {

    // STATE VARIABLES
    const { orderAssignmentsList, acceptOrderAssignmentModal, rejectOrderAssignmentModal, reassignOrderAssignmentModal } = useAppSelector((state) => state.orderAssignment);
    const { user } = useAppSelector((state) => state.auth);

    // ORDER ASSIGMENT HOOKS
    const { fetchOrderAssignments, page, setPage, size, setSize, totalPages, totalCount, isFetching } = useFetchOrderAssignments();

    useEffect(() => {
        if (!acceptOrderAssignmentModal && !rejectOrderAssignmentModal && !reassignOrderAssignmentModal) {
            let userId: UUID | undefined = undefined;

            if (user?.userRoles?.some((role) => ['RIDER'].includes(role.role.name))) {
                userId = user?.id;
            }

            fetchOrderAssignments({ page, size, assignedToId: userId });
        }
    }, [fetchOrderAssignments, page, size, acceptOrderAssignmentModal, rejectOrderAssignmentModal, reassignOrderAssignmentModal, user?.userRoles, user?.id]);

    const { orderAssignmentsColumns } = useOrderAssignmentsColumns();

    return (
        <main className='w-full flex flex-col gap-4'>
            <Table columns={orderAssignmentsColumns} data={orderAssignmentsList} showPagination={true} page={page} setPage={setPage} size={size} setSize={setSize} totalPages={totalPages} totalCount={totalCount} isLoading={isFetching} />
            <AcceptOrderAssignment />
            <RejectOrderAssignment />
            <ReassignOrderAssignment />
        </main>
    )
}

export default OrderAssignmentsPage;
