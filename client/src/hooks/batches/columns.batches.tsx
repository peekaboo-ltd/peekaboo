import CustomPopover from "@/components/inputs/CustomPopover";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";
import TableUserLabel from "@/components/users/TableUserLabel";
import {
  ellipsisHClassName,
  tableActionClassName,
} from "@/constants/inputs.constants";
import type { Batch } from "@/types/batch.type";
import { BatchStatus } from "@/types/batch.type";
import { formatDate } from "@/utils/strings.util";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faCircleInfo, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from '@/i18n/i18n';

export const useBatchesColumns = ({
  onView,
  onReview,
}: {
  onView: (batch: Batch) => void;
  onReview: (batch: Batch) => void;
}) => {
  const { t } = useI18n();
  const batchesColumns: ColumnDef<Batch>[] = useMemo(
    () => [
      {
        header: t('batches.reference'),
        accessorKey: "referenceId",
        cell: ({ row }) => (
          <ReferenceIdInput label={row?.original?.referenceId} />
        ),
      },
      {
        header: t('batches.name'),
        accessorKey: "name",
        cell: ({ row }) => row?.original?.name || `-`,
      },
      {
        header: t('common.status'),
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row?.original?.status} />,
      },
      {
        header: t('batches.orders'),
        id: "ordersCount",
        cell: ({ row }) => row.original.orders?.length ?? 0,
      },
      {
        header: t('common.createdBy'),
        id: "createdBy",
        cell: ({ row }) => <TableUserLabel user={row.original?.createdBy} />,
      },
      {
        header: t('common.lastUpdated'),
        accessorKey: "updatedAt",
        cell: ({ row }) =>
          formatDate(row?.original?.updatedAt, "DD/MM/YYYY HH:mm"),
      },
      {
        header: t('common.actions'),
        id: "actions",
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
              <menu className="flex flex-col items-center gap-1">
                <Link
                  className={tableActionClassName}
                  onClick={(e) => {
                    e.preventDefault();
                    onView(row.original);
                  }}
                  to="#"
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  {t('common.actions.view')}
                </Link>
                {row.original.status === BatchStatus.DRAFT && (
                  <Link
                    onClick={(e) => {
                      e.preventDefault();
                      onReview(row.original);
                    }}
                    className={tableActionClassName}
                    to="#"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    {t('batches.review')}
                  </Link>
                )}
              </menu>
            </CustomPopover>
          );
        },
      },
    ],
    [onReview, onView, t],
  );

  return { batchesColumns };
};
