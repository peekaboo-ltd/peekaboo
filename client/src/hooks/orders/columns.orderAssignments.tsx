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
import { useI18n } from '@/i18n/i18n';

export const useOrderAssignmentsColumns = () => {
    const { t } = useI18n();

    // STATE VARIABLES
    const dispatch = useAppDispatch();

    const orderAssignmentsColumns: ColumnDef<OrderAssignment>[] = useMemo(() => [
        {
            header: t('assignments.orderReference'),
            accessorKey: 'order.referenceId',
            cell: ({ row }) => <ReferenceIdInput label={row.original?.order?.referenceId} />,
        },
        {
            header: t('assignments.status'),
            accessorKey: 'status',
            cell: ({ row }) => <StatusBadge status={row?.original?.status as unknown as string} />,
        },
        {
            header: t('assignments.assignedTo'),
            accessorKey: 'assignedTo',
            cell: ({ row }) => {
                const assignmentStatus = row.original?.status as unknown as string;
                const canReassign = ['PENDING', 'ACTIVE'].includes(assignmentStatus);
                return (<menu className="w-full flex items-center gap-1"><TableUserLabel user={row.original?.assignedTo} label={row.original?.assignedTo?.name} /> {canReassign && <CustomTooltip label={t('assignments.reassign')}>
                    <FontAwesomeIcon icon={faPenToSquare} onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setReassignOrderAssignmentModal(true));
                        dispatch(setSelectedOrderAssignment(row.original));
                    }} className="text-(--ink) cursor-pointer hover:text-(--ink-hover) hover:bg-(--surface-hover) rounded-md p-2" /></CustomTooltip>}</menu>)
            },
        },
        {
            header: t('assignments.dateAssigned'),
            accessorKey: 'createdAt',
            cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
        },
        {
            header: t('common.actions'),
            accessorKey: 'actions',
            cell: ({ row }) => {

                return (
                    <CustomPopover trigger={<FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />}>
                        <menu className="w-full flex flex-col gap-1">
                            <Link className={tableActionClassName} to={`/assignments/${row.original.id}`}>
                                <FontAwesomeIcon icon={faCircleInfo} />
                                {t('common.actions.view')}
                            </Link>
                            {['PENDING'].includes(row.original?.status as unknown as string) && <>
                                <Link onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(setAcceptOrderAssignmentModal(true));
                                    dispatch(setSelectedOrderAssignment(row.original));
                                }} className={tableApproveActionClassName} to={`#`}>
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                    {t('assignments.accept')}
                                </Link>
                                <Link onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(setRejectOrderAssignmentModal(true));
                                    dispatch(setSelectedOrderAssignment(row.original));
                                }} className={tableDangerActionClassName} to={`#`}>
                                    <FontAwesomeIcon icon={faCircleXmark} />
                                    {t('assignments.reject')}
                                </Link>
                            </>}
                        </menu>
                    </CustomPopover>
                )
            },
        }
    ], [dispatch, t]);

    return { orderAssignmentsColumns };
}
