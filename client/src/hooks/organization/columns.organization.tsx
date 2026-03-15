import CustomPopover from "@/components/inputs/CustomPopover";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ellipsisHClassName, tableActionClassName } from "@/constants/inputs.constants";
import { Organization } from "@/types/organization.type";
import { OrganizationMembership } from "@/types/organizationMembership.types";
import { capitalizeString, formatDate } from "@/utils/strings.util";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faEllipsisH, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";

/**
 * Organizations Columns
 */
export const useOrganizationsColumns = () => {
    const organizationsColumns: ColumnDef<Organization>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
            },
            {
                header: 'Email',
                accessorKey: 'email',
            },
            {
                header: 'Phone',
                accessorKey: 'phoneNumber',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                header: 'Created',
                accessorKey: 'createdAt',
                cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
            },
            {
                header: 'Actions',
                id: 'actions',
                cell: ({ row }) => (
                    <CustomPopover
                        trigger={
                            <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
                        }
                    >
                        <menu className="w-full flex flex-col gap-1">
                            <Link className={tableActionClassName} to={`/organizations/${row.original.id}/manage`}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                                Manage
                            </Link>
                        </menu>
                    </CustomPopover>
                ),
            },
        ],
        []
    );

    return { organizationsColumns };
};

/**
 * Organization Members Columns
 */
export const useOrganizationMembersColumns = () => {
    const organizationMembersColumns: ColumnDef<OrganizationMembership>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: ({ row }) => row?.original?.user?.name || '-',
            },
            {
                header: 'Email',
                accessorKey: 'email',
                cell: ({ row }) => row?.original?.user?.email || '-',
            },
            {
                header: 'Phone',
                accessorKey: 'phoneNumber',
                cell: ({ row }) => row?.original?.user?.phoneNumber || '-',
            },
            {
                header: 'Role',
                accessorKey: 'role',
                cell: ({ row }) => capitalizeString(row?.original?.role) || '-',
            },
            {
                header: `Actions`,
                id: 'actions',
                cell: ({ row }) => (
                    <CustomPopover
                        trigger={
                            <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
                        }
                    >
                        <menu className="w-full flex flex-col gap-1">
                            <Link className={tableActionClassName} to={`/users/${row.original.userId}`}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                                View details
                            </Link>
                        </menu>
                    </CustomPopover>
                ),
            }
        ],
        []
    );
    return { organizationMembersColumns };
};
