import CustomPopover from "@/components/inputs/CustomPopover";
import CustomTooltip from "@/components/inputs/CustomTooltip";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";
import TableUserLabel from "@/components/users/TableUserLabel";
import { ellipsisHClassName, tableActionClassName, tableApproveActionClassName, tableDangerActionClassName } from "@/constants/inputs.constants";
import { useAppDispatch } from "@/states/hooks";
import { setAcceptOrderAssignmentModal, setReassignOrderAssignmentModal, setRejectOrderAssignmentModal, setSelectedOrderAssignment } from "@/states/slices/orderAssignment.slice";
import { OrderAssignment } from "@/types/orderAssignment.type";
import { formatDate } from "@/utils/strings.util";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck, faCircleInfo, faCircleXmark, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";

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
            header: 'Assignment Status',
            accessorKey: 'status',
            cell: ({ row }) => <StatusBadge status={row?.original?.status as unknown as string} />,
        },
        {
            header: 'Assigned To',
            accessorKey: 'assignedTo',
            cell: ({ row }) => {
                const assignmentStatus = row.original?.status as unknown as string;
                const canReassign = ['PENDING', 'ACTIVE'].includes(assignmentStatus);
                return (<menu className="w-full flex items-center gap-3"><TableUserLabel user={row.original?.assignedTo} label={row.original?.assignedTo?.name} /> {canReassign && <CustomTooltip label="Reassign">
                    <FontAwesomeIcon icon={faPenToSquare} onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setReassignOrderAssignmentModal(true));
                        dispatch(setSelectedOrderAssignment(row.original));
                    }} className="text-(--ink) cursor-pointer" /></CustomTooltip>}</menu>)
            },
        },
        {
            header: 'Date Assigned',
            accessorKey: 'createdAt',
            cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            cell: ({ row }) => {

                return (
                    <CustomPopover trigger={<FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />}>
                        <menu className="w-full flex flex-col gap-1">
                            <Link className={tableActionClassName} to={`/assignments/${row.original.id}`}>
                                <FontAwesomeIcon icon={faCircleInfo} />
                                View details
                            </Link>
                            {['PENDING'].includes(row.original?.status as unknown as string) && <>
                                <Link onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(setAcceptOrderAssignmentModal(true));
                                    dispatch(setSelectedOrderAssignment(row.original));
                                }} className={tableApproveActionClassName} to={`#`}>
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                    Accept
                                </Link>
                                <Link onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(setRejectOrderAssignmentModal(true));
                                    dispatch(setSelectedOrderAssignment(row.original));
                                }} className={tableDangerActionClassName} to={`#`}>
                                    <FontAwesomeIcon icon={faCircleXmark} />
                                    Reject
                                </Link>
                            </>}
                        </menu>
                    </CustomPopover>
                )
            },
        }
    ], [dispatch]);

    return { orderAssignmentsColumns };
}
