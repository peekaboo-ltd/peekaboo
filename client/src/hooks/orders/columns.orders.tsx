import { StatusBadge } from '@/components/inputs/StatusBadge';
import { ReferenceIdInput } from '@/components/inputs/TableInputs';
import TableUserLabel from '@/components/users/TableUserLabel';
import InlineRiderSelect from '@/components/orders/InlineRiderSelect';
import { Order } from '@/types/order.type';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { RoleTypes } from '@/types/auth.type';
import CustomPopover from '@/components/inputs/CustomPopover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faEllipsisH,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/inputs.constants';
import { Link } from 'react-router-dom';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import {
  setDeleteOrderModal,
  setSelectedOrder,
} from '@/states/slices/order.slice';

export const useOrdersColumns = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Check if user is a customer
  const isCustomer = user?.userRoles?.some((userRole) =>
    ['CUSTOMER', 'BUSINESS'].includes(userRole.role.name as RoleTypes),
  );

  const ordersColumns: ColumnDef<Order>[] = useMemo(() => {
    const columns: ColumnDef<Order>[] = [
      {
        header: 'Reference ID',
        accessorKey: 'referenceId',
        cell: ({ row }) => (
          <ReferenceIdInput label={row.original.referenceId} />
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const activities = row?.original?.activities
            ? [...row.original.activities].sort(
                (a, b) =>
                  new Date(b?.updatedAt ?? '').getTime() -
                  new Date(a?.updatedAt ?? '').getTime(),
              )
            : [];
          const firstActivity = activities.shift() || {
            status: row?.original?.status,
          };
          return <StatusBadge status={firstActivity?.status ?? ''} />;
        },
      },
      {
        header: 'Fee',
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
        cell: ({ row }) => (
          <InlineRiderSelect order={row.original} isCustomer={isCustomer} />
        ),
      },
      {
        header: 'Date added',
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: 'Last updated',
        accessorKey: 'updatedAt',
        cell: ({ row }) =>
          formatDate(row.original.updatedAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          return (
            <CustomPopover
              trigger={
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  className={ellipsisHClassName}
                />
              }
            >
              <menu className="w-full flex flex-col gap-1">
                <Link
                  className={tableActionClassName}
                  to={`/orders/${row.original.id}`}
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  View details
                </Link>
                {['CREATED'].includes(row.original.status) && (
                  <>
                    <Link
                      className={tableActionClassName}
                      to={`/p/orders/${row.original.id}`}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                      Resume
                    </Link>
                    <Link
                      className={tableActionClassName}
                      to={`#`}
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(setSelectedOrder(row.original));
                        dispatch(setDeleteOrderModal(true));
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-red-700"
                      />
                      Delete
                    </Link>
                  </>
                )}
              </menu>
            </CustomPopover>
          );
        },
      },
    );

    return columns;
  }, [dispatch, isCustomer]);

  return { ordersColumns };
};
