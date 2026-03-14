import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faPlus,
  faCircleCheck,
  faClockRotateLeft,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import { ColumnDef } from '@tanstack/react-table';
import Table from '@/components/table/Table';
import Button from '@/components/inputs/Button';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import CustomPopover from '@/components/inputs/CustomPopover';
import { ellipsisHClassName, tableActionClassName } from '@/constants/inputs.constants';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import type { Organization } from '@/types/organization.type';
import { OrganizationStatus } from '@/types/organization.type';
import { formatDate } from '@/utils/strings.util';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import {
  InternalPage,
  InternalPageHeader,
  InternalStatCard,
} from '@/components/layout/InternalPage';
import { useFetchOrganizations } from '@/hooks/organization/organization.hooks';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const OrganizationsPage = () => {
  useDocumentTitle('Organizations');

  const { fetchOrganizations, data, isFetching, page, setPage, size, setSize, totalPages, totalCount } = useFetchOrganizations();

  useEffect(() => {
    fetchOrganizations({ page, size });
  }, [page, size, fetchOrganizations]);

  const stats = useMemo(() => {
    const total = data?.data?.totalCount ?? 0;
    const active = data?.data?.rows?.filter((o: Organization) => o.status === OrganizationStatus.ACTIVE).length;
    const pending = data?.data?.rows?.filter((o: Organization) => o.status === OrganizationStatus.PENDING).length;
    return { total, active, pending };
  }, [data]);

  const columns: ColumnDef<Organization>[] = useMemo(
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
                <FontAwesomeIcon icon={faGear} />
              Manage
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    []
  );

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Admin"
          title="Organizations"
          description="Manage all registered organizations, assign billing plans, and view their members."
          actions={
            <Button
              primary
              route="/organizations/invite"
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Invite Organization
            </Button>
          }
        />
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        <InternalStatCard
          label="Total Organizations"
          value={stats?.total?.toString() ?? '0'}
          icon={<FontAwesomeIcon icon={faBuilding} />}
        />
        <InternalStatCard
          label="Active"
          value={stats?.active?.toString() ?? '0'}
          icon={<FontAwesomeIcon icon={faCircleCheck} />}
        />
        <InternalStatCard
          label="Pending"
          value={stats?.pending?.toString() ?? '0'}
          icon={<FontAwesomeIcon icon={faClockRotateLeft} />}
        />
      </motion.section>

      <motion.section variants={itemVariants}>
        <Table
          columns={columns}
          data={data?.data?.rows ?? []}
          showPagination
          page={page}
          setPage={setPage}
          size={size}
          setSize={setSize}
          totalPages={totalPages}
          totalCount={totalCount}
          isLoading={isFetching}
        />
      </motion.section>
    </InternalPage>
  );
};

export default OrganizationsPage;
