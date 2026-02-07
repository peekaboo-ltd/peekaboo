import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";
import TableUserLabel from "@/components/users/TableUserLabel";
import InlineRiderSelect from "@/components/orders/InlineRiderSelect";
import { Order } from "@/types/order.type";
import { formatCurrency, formatDate } from "@/utils/strings.util";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useAppSelector } from "@/states/hooks";
import { RoleTypes } from "@/types/auth.type";

export const useOrdersColumns = () => {
    const { user } = useAppSelector((state) => state.auth);

    // Check if user is a customer
    const isCustomer = user?.userRoles?.some(
        (userRole) => userRole.role.name === RoleTypes.CUSTOMER
    );

    const ordersColumns: ColumnDef<Order>[] = useMemo(() => {
        const columns: ColumnDef<Order>[] = [
            {
                header: 'Reference ID',
                accessorKey: 'referenceId',
                cell: ({ row }) => <ReferenceIdInput label={row.original.referenceId} />,
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const activities = row?.original?.activities 
                        ? [...row.original.activities].sort((a, b) => new Date(b?.updatedAt ?? '').getTime() - new Date(a?.updatedAt ?? '').getTime())
                        : [];
                    const firstActivity = activities.shift() || { status: row?.original?.status };
                    return <StatusBadge status={firstActivity?.status ?? ''} />;
                },
            },
            {
                header: 'Final Fee',
                accessorKey: 'finalFee',
                cell: ({ row }) => formatCurrency(row.original?.finalFee ?? 0),
            },
        ];

        // Only show 'Created By' column if user is not a customer
        if (!isCustomer) {
            columns.push({
                header: 'Created By',
                accessorKey: 'createdById',
                cell: ({ row }) => <TableUserLabel user={row.original?.createdBy} />,
            });
        }

        columns.push(
            {
                header: 'Assigned To',
                accessorKey: 'assignments',
                cell: ({ row }) => <InlineRiderSelect order={row.original} isCustomer={isCustomer} />,
            },
            {
                header: 'Date added',
                accessorKey: 'createdAt',
                cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
            },
            {
                header: 'Last updated',
                accessorKey: 'updatedAt',
                cell: ({ row }) => formatDate(row.original.updatedAt, 'DD/MM/YYYY HH:mm'),
            }
        );

        return columns;
    }, [isCustomer]);

    return { ordersColumns };
}