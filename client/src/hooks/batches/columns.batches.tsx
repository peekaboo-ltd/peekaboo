import CustomPopover from '@/components/inputs/CustomPopover';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import { ReferenceIdInput } from '@/components/inputs/TableInputs';
import TableUserLabel from '@/components/users/TableUserLabel';
import { ellipsisHClassName, tableActionClassName } from '@/constants/inputs.constants';
import type { Batch } from '@/types/batch.type';
import { BatchStatus } from '@/types/batch.type';
import { formatDate } from '@/utils/strings.util';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const useBatchesColumns = ({
  onView,
  onReview,
}: {
  onView: (batch: Batch) => void;
  onReview: (batch: Batch) => void;
}) => {
  const batchesColumns: ColumnDef<Batch>[] = useMemo(
    () => [
      {
        header: 'Reference',
        accessorKey: 'referenceId',
        cell: ({ row }) => (<ReferenceIdInput label={row?.original?.referenceId} />),
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) =>
          row?.original?.name || (
            `-`
          ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (<StatusBadge status={row?.original?.status} />),
      },
      {
        header: 'Orders',
        id: 'ordersCount',
        cell: ({ row }) => row.original.orders?.length ?? 0,
      },
      {
        header: 'Created By',
        id: 'createdBy',
        cell: ({ row }) => <TableUserLabel user={row.original?.createdBy} />,
      },
      {
        header: 'Last updated',
        accessorKey: 'updatedAt',
        cell: ({ row }) => formatDate(row?.original?.updatedAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          return (
            <CustomPopover trigger={<FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />}>
              <menu className="flex items-center gap-1">
                {row.original.status === BatchStatus.DRAFT && (
                  <Link onClick={(e) => {
                    e.preventDefault();
                    onReview(row.original);
                  }} className={tableActionClassName} to="#">
                    <FontAwesomeIcon icon={faPenToSquare} />
                    Review
                  </Link>
                )}
                <Link className={tableActionClassName} onClick={(e) => {
                  e.preventDefault();
                  onView(row.original);
                }} to="#">
                  <FontAwesomeIcon icon={faCircleInfo} />
                  View details
                </Link>
              </menu>
            </CustomPopover>
          )
        },
      },
    ],
    [onReview, onView],
  );

  return { batchesColumns };
};
