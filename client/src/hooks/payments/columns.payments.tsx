import { StatusBadge } from '@/components/inputs/StatusBadge';
import { Payment, KpayPaymentStatus } from '@/types/payment.types';
import { formatCurrency, formatDate, capitalizeString } from '@/utils/strings.util';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useAppDispatch } from '@/states/hooks';
import CustomPopover from '@/components/inputs/CustomPopover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/inputs.constants';
import {
  setSelectedPayment,
  setUpdateStatusModal,
} from '@/states/slices/payment.slice';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  [KpayPaymentStatus.PENDING]: 'PENDING',
  [KpayPaymentStatus.SUCCESSFUL]: 'PAID',
  [KpayPaymentStatus.FAILED]: 'CANCELLED',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  momo: 'Mobile Money',
  cc: 'Credit Card',
  bank: 'Bank',
  spenn: 'Spenn',
  smartcash: 'SmartCash',
};

export const useAdminPaymentsColumns = () => {
  const dispatch = useAppDispatch();

  const adminPaymentsColumns: ColumnDef<Payment>[] = useMemo(() => {
    return [
      {
        header: 'Reference',
        accessorKey: 'internalReferenceId',
        cell: ({ row }) => (
          <span className="text-xs truncate max-w-[120px] block" title={row.original.internalReferenceId}>
            {row.original.internalReferenceId?.slice(0, 8)}...
          </span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <StatusBadge
            status={PAYMENT_STATUS_LABELS[row.original.status] || row.original.status}
          />
        ),
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ row }) =>
          formatCurrency(row.original.amount, row.original.currency),
      },
      {
        header: 'Currency',
        accessorKey: 'currency',
        cell: ({ row }) => row.original.currency,
      },
      {
        header: 'Method',
        accessorKey: 'method',
        cell: ({ row }) =>
          PAYMENT_METHOD_LABELS[row.original.method] ||
          capitalizeString(row.original.method),
      },
      {
        header: 'Customer',
        accessorKey: 'customerName',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">{row.original.customerName || '-'}</span>
            {row.original.customerEmail && (
              <span className="text-xs text-muted-foreground">
                {row.original.customerEmail}
              </span>
            )}
          </div>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
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
                  to={`/payments/${row?.original?.id}`}
                  className={tableActionClassName}
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  View details
                </Link>
                <Link
                  to={`#`}
                  className={tableActionClassName}
                  onClick={() => {
                    dispatch(setSelectedPayment(row.original));
                    dispatch(setUpdateStatusModal(true));
                  }}
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                  Update Status
                </Link>
              </menu>
            </CustomPopover>
          );
        },
      },
    ];
  }, [dispatch]);

  return { adminPaymentsColumns };
};
