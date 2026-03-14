import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useFetchOrganizationsQuery } from '@/api/queries/organization.queries';
import type { Organization } from '@/types/organization.type';
import { OrganizationStatus } from '@/types/organization.type';
import { formatDate } from '@/utils/strings.util';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

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
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const { data, isFetching, refetch } = useFetchOrganizationsQuery({ page, size });

  useEffect(() => {
    refetch();
  }, [page, size, refetch]);

  const organizations: Organization[] = data?.data?.list ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const stats = useMemo(() => {
    const total = data?.data?.totalCount ?? 0;
    const active = organizations.filter((o) => o.status === OrganizationStatus.ACTIVE).length;
    const pending = organizations.filter((o) => o.status === OrganizationStatus.PENDING).length;
    return { total, active, pending };
  }, [organizations, data]);

  const columns: ColumnDef<Organization>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <span className="font-medium text-[13px] text-slate-900">{row.original.name || '—'}</span>
        ),
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => (
          <span className="text-[13px] text-slate-600">{row.original.email || '—'}</span>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'phoneNumber',
        cell: ({ row }) => (
          <span className="text-[13px] text-slate-600">{row.original.phoneNumber || '—'}</span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ row }) => (
          <span className="text-[13px] text-slate-500">
            {formatDate(row.original.createdAt, 'DD/MM/YYYY')}
          </span>
        ),
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
              <button
                className={tableActionClassName}
                onClick={() => navigate(`/organizations/${row.original.id}/manage`)}
              >
                <FontAwesomeIcon icon={faGear} />
                Manage
              </button>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [navigate]
  );

  return (
    <motion.main
      className="relative w-full flex flex-col gap-6 min-h-screen bg-[#FAFAF7]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative blur blobs */}
      <figure
        className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-secondary-200/30 blur-3xl"
        aria-hidden="true"
      />
      <figure
        className="pointer-events-none absolute -left-32 bottom-20 h-[360px] w-[360px] rounded-full bg-primary-200/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Header */}
      <motion.header
        className="relative flex flex-col gap-4"
        variants={itemVariants}
      >
        <section className="flex items-start justify-between gap-4 flex-wrap">
          <article>
            <p className="text-xs uppercase tracking-[0.28em] text-secondary-700 font-medium">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#25343F]">Organizations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all registered organizations, assign billing plans, and view their members.
            </p>
          </article>
          <menu className="flex items-center gap-2 flex-wrap">
            <Button
              primary
              route="/organizations/invite"
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Invite Organization
            </Button>
          </menu>
        </section>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: 'Total Organizations',
              value: stats.total.toString(),
              icon: faBuilding,
              iconBg: 'bg-primary-50 text-primary-900',
            },
            {
              label: 'Active',
              value: stats.active.toString(),
              icon: faCircleCheck,
              iconBg: 'bg-secondary-50 text-secondary-800',
            },
            {
              label: 'Pending',
              value: stats.pending.toString(),
              icon: faClockRotateLeft,
              iconBg: 'bg-amber-50 text-amber-700',
            },
          ].map((card) => (
            <article
              key={card.label}
              className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {card.label}
                </p>
                <p className="text-xl font-semibold text-[#25343F] mt-2">{card.value}</p>
              </div>
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <FontAwesomeIcon icon={card.icon} />
              </span>
            </article>
          ))}
        </section>
      </motion.header>

      {/* Table */}
      <motion.section variants={itemVariants} className="relative">
        <Table
          columns={columns}
          data={organizations}
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
    </motion.main>
  );
};

export default OrganizationsPage;
