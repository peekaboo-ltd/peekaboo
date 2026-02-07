import CustomTooltip from "@/components/inputs/CustomTooltip";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";
import TableUserLabel from "@/components/users/TableUserLabel";
import { useAppDispatch } from "@/states/hooks";
import { setAcceptOrderAssignmentModal, setReassignOrderAssignmentModal, setRejectOrderAssignmentModal, setSelectedOrderAssignment } from "@/states/slices/orderAssignment.slice";
import { OrderAssignment } from "@/types/orderAssignment.type";
import { formatDate } from "@/utils/strings.util";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck, faCircleInfo, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const useOrderAssignmentsColumns = () => {

    // STATE VARIABLES
    const dispatch = useAppDispatch();

    // NAVIGATION
    const navigate = useNavigate();

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
                return (<menu className="w-full flex items-center gap-3"><TableUserLabel user={row.original?.assignedTo} label={row.original?.assignedTo?.name} /> {!['ACTIVE'].includes(row.original?.status as unknown as string) && <CustomTooltip label="Reassign">
                    <FontAwesomeIcon icon={faPenToSquare} onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setReassignOrderAssignmentModal(true));
                        dispatch(setSelectedOrderAssignment(row.original));
                    }} className="text-black cursor-pointer" /></CustomTooltip>}</menu>)
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
                    <menu className="w-full flex items-center gap-3 justify-center">
                        {['PENDING'].includes(row.original?.status as unknown as string) && <> <CustomTooltip label="Accept">
                            <FontAwesomeIcon onClick={(e) => {
                                e.stopPropagation();
                                dispatch(setAcceptOrderAssignmentModal(true));
                                dispatch(setSelectedOrderAssignment(row.original));
                            }} icon={faCircleCheck} size="lg" className="cursor-pointer text-black" />
                        </CustomTooltip>
                            <CustomTooltip label="Reject">
                                <FontAwesomeIcon onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(setRejectOrderAssignmentModal(true));
                                    dispatch(setSelectedOrderAssignment(row.original));
                                }} icon={faCircleXmark} size="lg" className="cursor-pointer text-black" />
                            </CustomTooltip></>}
                        <CustomTooltip label="Info">
                            <FontAwesomeIcon onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/assignments/${row.original.id}`);
                            }} icon={faCircleInfo} size="lg" className="cursor-pointer text-gray-500" />
                        </CustomTooltip>
                    </menu>
                )
            },
        }
    ], [dispatch, navigate]);

    return { orderAssignmentsColumns };
}
