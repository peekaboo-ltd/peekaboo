import { StatusBadge } from '@/components/inputs/StatusBadge';
import { ReferenceIdInput } from '@/components/inputs/TableInputs';
import TableUserLabel from '@/components/users/TableUserLabel';
import InlineRiderSelect from '@/components/orders/InlineRiderSelect';
import {
  type Order,
} from '@/types/order.type';
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
  tableDangerActionClassName,
} from '@/constants/inputs.constants';
import { Link } from 'react-router-dom';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import {
  setDeleteOrderModal,
  setSelectedOrder,
} from '@/states/slices/order.slice';
import { useI18n } from '@/i18n/i18n';

export const useOrdersColumns = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Check if user is a customer
  const isCustomer = user?.userRoles?.some((userRole) =>
    ['CUSTOMER', 'BUSINESS'].includes(userRole.role.name as RoleTypes),
  );

  const ordersColumns: ColumnDef<Order>[] = useMemo(() => {
    const columns: ColumnDef<Order>[] = [
      {
        header: t('common.referenceId'),
        accessorKey: 'referenceId',
        cell: ({ row }) => (
          <ReferenceIdInput label={row.original.referenceId} />
        ),
      },
      {
        header: t('common.status'),
        accessorKey: 'status',
        cell: ({ row }) => {
          return <StatusBadge status={row?.original?.status ?? ''} />;
        },
      },
      {
        header: t('common.fee'),
        accessorKey: 'finalFee',
        cell: ({ row }) => formatCurrency(row.original?.finalFee ?? 0),
      },
    ];

    // Only show 'Created By' column if user is not a customer
    if (!isCustomer) {
      columns.push({
        header: t('common.createdBy'),
        accessorKey: 'createdById',
        cell: ({ row }) => <TableUserLabel user={row.original?.createdBy} />,
      });
    }

    columns.push(
      {
        header: t('common.contactVia'),
        accessorKey: 'preferredContactMethod',
        cell: ({ row }) => {
          const method = row.original.preferredContactMethod;
          return (
            <p className="text-sm text-(--ink)">
              {method ? t(`publicOrder.contact.${method.toLowerCase()}`) : '—'}
            </p>
          );
        },
      },
      {
        header: t('common.assignedTo'),
        accessorKey: 'assignments',
        cell: ({ row }) => (
          <InlineRiderSelect order={row.original} isCustomer={isCustomer} />
        ),
      },
      {
        header: t('common.dateAdded'),
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: t('common.lastUpdated'),
        accessorKey: 'updatedAt',
        cell: ({ row }) =>
          formatDate(row.original.updatedAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: t('common.actions'),
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
                  {t('common.actions.view')}
                </Link>
                {['CREATED', 'PENDING'].includes(row.original.status) && (
                  <>
                    <Link
                      className={tableActionClassName}
                      to={`/p/orders/${row.original.id}`}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                      {t('common.actions.resume')}
                    </Link>
                    <Link
                      className={tableDangerActionClassName}
                      to={`#`}
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(setSelectedOrder(row.original));
                        dispatch(setDeleteOrderModal(true));
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      {t('common.actions.delete')}
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
  }, [dispatch, isCustomer, t]);

  return { ordersColumns };
};
