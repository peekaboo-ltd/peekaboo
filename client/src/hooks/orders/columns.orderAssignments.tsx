import CustomPopover from "@/components/inputs/CustomPopover";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ActionButton, ReferenceIdInput } from "@/components/inputs/TableInputs";
import TableUserLabel from "@/components/users/TableUserLabel";
import { ellipsisHClassName } from "@/constants/inputs.constants";
import { useAppDispatch } from "@/states/hooks";
import { setAcceptOrderAssignmentModal, setRejectOrderAssignmentModal, setSelectedOrderAssignment } from "@/states/slices/orderAssignment.slice";
import { OrderAssignment } from "@/types/orderAssignment.type";
import { capitalizeString, formatDate } from "@/utils/strings.util";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck, faCircleInfo, faCircleXmark, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export const useOrderAssignmentsColumns = () => {

    // STATE VARIABLES
    const dispatch = useAppDispatch();

    const orderAssignmentsColumns: ColumnDef<OrderAssignment>[] = useMemo(() => [
        {
            header: 'Order Reference',
            accessorKey: 'order.referenceId',
            cell: ({ row }) => <ReferenceIdInput label={row.original?.order?.referenceId} />,
        },
        {
            header: 'Order Type',
            accessorKey: 'order.type',
            cell: ({ row }) => capitalizeString(row?.original?.order?.type),
        },
        {
            header: 'Assignment Status',
            accessorKey: 'status',
            cell: ({ row }) => <StatusBadge status={row?.original?.status as unknown as string} />,
        },
        {
            header: 'Assigned To',
            accessorKey: 'assignedTo',
            cell: ({ row }) => <TableUserLabel user={row.original?.assignedTo} label={row.original?.assignedTo?.name} />,
        },
        {
            header: 'Date Created',
            accessorKey: 'createdAt',
            cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
        },
        {
            header: 'Last Updated',
            accessorKey: 'updatedAt',
            cell: ({ row }) => formatDate(row.original.updatedAt, 'DD/MM/YYYY HH:mm'),
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            cell: ({ row }) => {
                return (
                    <CustomPopover trigger={<FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />}>
                        <menu className="w-full flex flex-col gap-1">
                            <ActionButton icon={faCircleInfo} route={`/order-assignments/${row.original.id}`} label="View details" />
                            <ActionButton icon={faCircleCheck} route={`/order-assignments/${row.original.id}`} label="Accept" iconClassName="text-green-700" onClick={(e) => {
                                e.preventDefault();
                                dispatch(setSelectedOrderAssignment(row.original));
                                dispatch(setAcceptOrderAssignmentModal(true));
                            }} />
                            <ActionButton icon={faCircleXmark} route={`/order-assignments/${row.original.id}`} label="Reject" iconClassName="text-red-700" onClick={(e) => {
                                e.preventDefault();
                                dispatch(setSelectedOrderAssignment(row.original));
                                dispatch(setRejectOrderAssignmentModal(true));
                            }} />
                            <ActionButton icon={faPenToSquare} route={`/order-assignments/${row.original.id}`} label="Reassign" iconClassName="text-primary" />
                        </menu>
                    </CustomPopover>
                )
            },
        }
    ], [dispatch]);

    return { orderAssignmentsColumns };
}
