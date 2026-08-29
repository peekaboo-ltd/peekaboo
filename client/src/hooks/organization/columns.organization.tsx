import CustomPopover from "@/components/inputs/CustomPopover";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import { ellipsisHClassName, tableActionClassName } from "@/constants/inputs.constants";
import { Organization } from "@/types/organization.type";
import { OrganizationMembership } from "@/types/organizationMembership.types";
import { formatDate } from "@/utils/strings.util";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faEllipsisH, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from '@/i18n/i18n';

/**
 * Organizations Columns
 */
export const useOrganizationsColumns = () => {
    const { t } = useI18n();
    const organizationsColumns: ColumnDef<Organization>[] = useMemo(
        () => [
            {
                header: t('organization.columnName'),
                accessorKey: 'name',
            },
            {
                header: t('organization.emailLabel'),
                accessorKey: 'email',
            },
            {
                header: t('organization.columnPhone'),
                accessorKey: 'phoneNumber',
            },
            {
                header: t('common.status'),
                accessorKey: 'status',
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                header: t('organization.columnCreated'),
                accessorKey: 'createdAt',
                cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
            },
            {
                header: t('common.actions'),
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
                                {t('organization.manage')}
                            </Link>
                        </menu>
                    </CustomPopover>
                ),
            },
        ],
        [t]
    );

    return { organizationsColumns };
};

/**
 * Organization Members Columns
 */
export const useOrganizationMembersColumns = () => {
    const { t } = useI18n();
    const organizationMembersColumns: ColumnDef<OrganizationMembership>[] = useMemo(
        () => [
            {
                header: t('organization.columnName'),
                accessorKey: 'name',
                cell: ({ row }) => row?.original?.user?.name || '-',
            },
            {
                header: t('organization.emailLabel'),
                accessorKey: 'email',
                cell: ({ row }) => row?.original?.user?.email || '-',
            },
            {
                header: t('organization.columnPhone'),
                accessorKey: 'phoneNumber',
                cell: ({ row }) => row?.original?.user?.phoneNumber || '-',
            },
            {
                header: t('organization.columnRole'),
                accessorKey: 'role',
                cell: ({ row }) => row?.original?.role ? t(`role.${row.original.role.toLowerCase()}`) : '-',
            },
            {
                header: t('common.actions'),
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
                                {t('organization.viewDetails')}
                            </Link>
                        </menu>
                    </CustomPopover>
                ),
            }
        ],
        [t]
    );
    return { organizationMembersColumns };
};
