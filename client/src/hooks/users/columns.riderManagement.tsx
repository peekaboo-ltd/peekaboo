import { StatusBadge } from "@/components/inputs/StatusBadge";
import { RiderPerformanceItem } from "@/types/user.type";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const getPerformanceLabel = (rider: RiderPerformanceItem) => {
  if (
    rider.rank <= 3 &&
    rider.totalDeliveriesCompleted > 0 &&
    rider.failedDeliveries <= 1 &&
    rider.canceledDeliveries <= 2
  ) {
    return { text: "Top Performer", className: "bg-(--surface) text-(--ink)" };
  }

  if (rider.totalDeliveriesCompleted >= 8 && rider.failedDeliveries <= 3) {
    return { text: "Doing Well", className: "bg-(--surface) text-(--ink)" };
  }

  if (rider.totalDeliveriesCompleted === 0 || rider.failedDeliveries >= 4) {
    return { text: "Needs Support", className: "bg-(--surface) text-(--ink)" };
  }

  return { text: "Average", className: "bg-(--surface) text-(--ink)" };
};

export const useRiderManagementColumns = (
  onViewDetails: (rider: RiderPerformanceItem) => void,
) => {
  const riderManagementColumns: ColumnDef<RiderPerformanceItem>[] = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "rank",
        cell: ({ row }) => (
          <span className="font-medium">#{row.original.rank}</span>
        ),
      },
      {
        header: "Rider",
        accessorKey: "riderName",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.riderName || "-"}</span>
            <span className="text-xs text-(--muted)">
              {row.original.riderEmail || "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Phone",
        accessorKey: "riderPhoneNumber",
        cell: ({ row }) => row.original.riderPhoneNumber || "-",
      },
      {
        header: "Status",
        accessorKey: "riderStatus",
        cell: ({ row }) => <StatusBadge status={row.original.riderStatus} />,
      },
      {
        header: "Performance",
        accessorKey: "performance",
        cell: ({ row }) => {
          const performance = getPerformanceLabel(row.original);
          return (
            <span
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${performance.className}`}
            >
              {performance.text}
            </span>
          );
        },
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <Link
            to={`/users/${row?.original?.riderId}`}
            onClick={(e) => {
              e.preventDefault();
              onViewDetails(row.original);
            }}
            className="text-(--ink) underline text-[11px] underline-offset-2"
          >
            View details
          </Link>
        ),
      },
    ],
    [onViewDetails],
  );

  return { riderManagementColumns };
};
