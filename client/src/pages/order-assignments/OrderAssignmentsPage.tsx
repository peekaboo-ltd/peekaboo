import Table from '@/components/table/Table';
import { useOrderAssignmentsColumns } from '@/hooks/orders/columns.orderAssignments';
import { useFetchOrderAssignments } from '@/hooks/orders/orderAssignments.hooks';
import { useAppSelector } from '@/states/hooks';
import { useEffect } from 'react'
import AcceptOrderAssignment from './AcceptOrderAssignment';
import RejectOrderAssignment from './RejectOrderAssignment';
import ReassignOrderAssignment from './ReassignOrderAssignment';
import StaffLayout from '@/components/staff/StaffLayout';

const OrderAssignmentsPage = () => {

    // STATE VARIABLES
    const { orderAssignmentsList, acceptOrderAssignmentModal, rejectOrderAssignmentModal, reassignOrderAssignmentModal } = useAppSelector((state) => state.orderAssignment);

    // ORDER ASSIGMENT HOOKS
    const { fetchOrderAssignments, page, setPage, size, setSize, totalPages, totalCount, isFetching } = useFetchOrderAssignments();

    useEffect(() => {
        if (!acceptOrderAssignmentModal && !rejectOrderAssignmentModal && !reassignOrderAssignmentModal) {
            fetchOrderAssignments({ page, size });
        }
    }, [fetchOrderAssignments, page, size, acceptOrderAssignmentModal, rejectOrderAssignmentModal, reassignOrderAssignmentModal]);

    const { orderAssignmentsColumns } = useOrderAssignmentsColumns();

    return (
        <StaffLayout>
            <div className="p-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Assignments</h1>
                    <p className="text-sm text-gray-600">Handle rider acceptances and reassignments.</p>
                </div>
                <main className='w-full flex flex-col gap-4'>
                    <Table columns={orderAssignmentsColumns} data={orderAssignmentsList} showPagination={true} page={page} setPage={setPage} size={size} setSize={setSize} totalPages={totalPages} totalCount={totalCount} isLoading={isFetching} />
                    <AcceptOrderAssignment />
                    <RejectOrderAssignment />
                    <ReassignOrderAssignment />
                </main>
            </div>
        </StaffLayout>
    )
}

export default OrderAssignmentsPage;
