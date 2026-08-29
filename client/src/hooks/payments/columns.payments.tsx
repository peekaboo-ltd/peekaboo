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
import { useI18n } from '@/i18n/i18n';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  [KpayPaymentStatus.PENDING]: 'PENDING',
  [KpayPaymentStatus.SUCCESSFUL]: 'PAID',
  [KpayPaymentStatus.FAILED]: 'CANCELLED',
};

export const useAdminPaymentsColumns = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();

  const adminPaymentsColumns: ColumnDef<Payment>[] = useMemo(() => {
    const paymentMethodLabels: Record<string, string> = {
      momo: t('payments.mobileMoney'),
      cc: t('payments.creditCard'),
      bank: t('payments.bank'),
      spenn: 'Spenn',
      smartcash: 'SmartCash',
    };

    return [
      {
        header: t('payments.reference'),
        accessorKey: 'internalReferenceId',
        cell: ({ row }) => (
          <span className="text-xs truncate max-w-[120px] block" title={row.original.internalReferenceId}>
            {row.original.internalReferenceId?.slice(0, 8)}...
          </span>
        ),
      },
      {
        header: t('common.status'),
        accessorKey: 'status',
        cell: ({ row }) => (
          <StatusBadge
            status={PAYMENT_STATUS_LABELS[row.original.status] || row.original.status}
          />
        ),
      },
      {
        header: t('paymentDetails.amount'),
        accessorKey: 'amount',
        cell: ({ row }) =>
          formatCurrency(row.original.amount, row.original.currency),
      },
      {
        header: t('paymentDetails.currency'),
        accessorKey: 'currency',
        cell: ({ row }) => row.original.currency,
      },
      {
        header: t('paymentDetails.method'),
        accessorKey: 'method',
        cell: ({ row }) =>
          paymentMethodLabels[row.original.method] ||
          capitalizeString(row.original.method),
      },
      {
        header: t('payments.customer'),
        accessorKey: 'customerName',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">{row.original.customerName || '-'}</span>
            {row.original.customerEmail && (
              <span className="type-meta">
                {row.original.customerEmail}
              </span>
            )}
          </div>
        ),
      },
      {
        header: t('payments.date'),
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
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
                  to={`/payments/${row?.original?.id}`}
                  className={tableActionClassName}
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  {t('paymentStatus.viewDetails')}
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
                  {t('paymentStatus.update')}
                </Link>
              </menu>
            </CustomPopover>
          );
        },
      },
    ];
  }, [dispatch, t]);

  return { adminPaymentsColumns };
};
