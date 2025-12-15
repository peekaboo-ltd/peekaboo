import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";
import TableUserLabel from "@/components/users/TableUserLabel";
import { Order } from "@/types/order.type";
import { capitalizeString, formatCurrency, formatDate } from "@/utils/strings.util";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export const useOrdersColumns = () => {
        const navigate = useNavigate();

    const ordersColumns: ColumnDef<Order>[] = useMemo(() => [
        {
            header: 'Reference ID',
            accessorKey: 'referenceId',
            cell: ({ row }) => (
                <Link to={`/orders/${row.original.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    {row.original.referenceId}
                </Link>
            ),
        },
        {
            header: 'Type',
            accessorKey: 'type',
            cell: ({ row }) => capitalizeString(row?.original?.type),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => <StatusBadge status={row?.original?.activities?.[row?.original?.activities?.length - 1]?.status} />,
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
            header: 'Date added',
            accessorKey: 'createdAt',
            cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
        },
        {
            header: 'Last updated',
            accessorKey: 'updatedAt',
            cell: ({ row }) => formatDate(row.original.updatedAt, 'DD/MM/YYYY HH:mm'),
        },
            {
                header: 'Actions',
                accessorKey: 'actions',
                cell: ({ row }) => (
                    <button
                        onClick={() => navigate(`/orders/${row.original.id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </button>
                ),
            },
        ], [navigate]);

    return { ordersColumns };
}