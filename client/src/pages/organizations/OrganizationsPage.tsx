import { useEffect, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faPlus,
  faCircleCheck,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import Table from '@/components/table/Table';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import type { Organization } from '@/types/organization.type';
import { OrganizationStatus } from '@/types/organization.type';
import {
  InternalPage,
  InternalPageHeader,
  InternalStatCard,
} from '@/components/layout/InternalPage';
import { useFetchOrganizations } from '@/hooks/organization/organization.hooks';
import { useOrganizationsColumns } from '@/hooks/organization/columns.organization';
import { useAppSelector } from '@/states/hooks';

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

  // STATE VARIABLES
  const { organizationsList } = useAppSelector((state) => state.organization);

  const { fetchOrganizations, isFetching, page, setPage, size, setSize, totalPages, totalCount } = useFetchOrganizations();

  const { organizationsColumns } = useOrganizationsColumns();

  useEffect(() => {
    fetchOrganizations({ page, size });
  }, [page, size, fetchOrganizations]);

  const stats = useMemo(() => {
    const total = organizationsList?.length ?? 0;
    const active = organizationsList?.filter((o: Organization) => o?.status === OrganizationStatus.ACTIVE).length ?? 0;
    const pending = organizationsList?.filter((o: Organization) => o?.status === OrganizationStatus.PENDING).length ?? 0;
    return { total, active, pending };
  }, [organizationsList]);

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
          columns={organizationsColumns}
          data={organizationsList ?? []}
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
