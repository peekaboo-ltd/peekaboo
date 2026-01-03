import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";
import TableUserLabel from "@/components/users/TableUserLabel";
import InlineRiderSelect from "@/components/orders/InlineRiderSelect";
import { Order } from "@/types/order.type";
import { formatCurrency, formatDate } from "@/utils/strings.util";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export const useOrdersColumns = () => {
    const ordersColumns: ColumnDef<Order>[] = useMemo(() => [
        {
            header: 'Reference ID',
            accessorKey: 'referenceId',
            cell: ({ row }) => <ReferenceIdInput label={row.original.referenceId} />,
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const activities = row?.original?.activities ? [...row.original.activities] : [];
                const firstActivity = activities.shift();
                return <StatusBadge status={firstActivity?.status ?? ''} />;
            },
        },
        {
            header: 'Final Fee',
            accessorKey: 'finalFee',
            cell: ({ row }) => formatCurrency(row.original?.finalFee ?? 0),
        },
        {
            header: 'Created By',
            accessorKey: 'createdById',
            cell: ({ row }) => <TableUserLabel user={row.original?.createdBy} />,
        },
        {
            header: 'Assigned To',
            accessorKey: 'assignments',
            cell: ({ row }) => <InlineRiderSelect order={row.original} />,
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
        },
    ], []);

    return { ordersColumns };
}