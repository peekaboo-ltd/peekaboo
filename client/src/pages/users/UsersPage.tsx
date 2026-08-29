import Table from '@/components/table/Table';
import { useUsersColumns } from '@/hooks/users/columns.users';
import { useFetchUsers } from '@/hooks/users/users.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { useEffect, useMemo, useState } from 'react';
import CreateUserModal from './CreateUserModal';
import { setCreateUserModal } from '@/states/slices/user.slice';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faBuilding,
  faUsersGear,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';
import { RoleTypes } from '@/types/auth.type';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import useDebounce from '@/hooks/common/debounce.hooks';

const ALL_ROLES_VALUE = 'ALL';

const UsersPage = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { usersList, createUserModal } = useAppSelector((state) => state.user);
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(ALL_ROLES_VALUE);
  const debouncedSearch = useDebounce(search, 350);
  const hasOrganizationMembership =
    (user?.organizationMembership?.length ?? 0) > 0;
  const organizationId = hasOrganizationMembership
    ? user?.organizationMembership?.[0]?.organization?.id
    : undefined;
  useDocumentTitle(t('users.docTitle'));

  const {
    fetchUsers,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
    isFetching,
  } = useFetchUsers();

  const roleOptions = useMemo(
    () => [
      { label: t('users.allRoles'), value: ALL_ROLES_VALUE },
      ...Object.values(RoleTypes)
        .filter((role) => role !== RoleTypes.GUEST)
        .map((role) => ({
          label: t(`role.${role.toLowerCase()}`),
          value: role,
        })),
    ],
    [t],
  );

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedRole, setPage]);

  useEffect(() => {
    if (!createUserModal) {
      const filters = {
        page,
        size,
        search: debouncedSearch.trim() || undefined,
        roles:
          selectedRole !== ALL_ROLES_VALUE ? [selectedRole] : undefined,
      };

      if (hasOrganizationMembership && organizationId) {
        fetchUsers({ ...filters, organizationId });
      } else {
        fetchUsers(filters);
      }
    }
  }, [
    fetchUsers,
    page,
    size,
    debouncedSearch,
    selectedRole,
    createUserModal,
    hasOrganizationMembership,
    organizationId,
  ]);

  const { usersColumns } = useUsersColumns();
  const { activeUsers, adminCount, teamMemberCount } = usersList.reduce(
    (acc, user) => {
      if (user.status === 'ACTIVE') acc.activeUsers += 1;
      const roles =
        user.userRoles?.map((userRole) => userRole.role?.name) || [];
      if (roles.includes(RoleTypes.ADMIN)) acc.adminCount += 1;
      if (
        roles.includes(RoleTypes.STAFF) ||
        roles.includes(RoleTypes.BUSINESS)
      ) {
        acc.teamMemberCount += 1;
      }
      return acc;
    },
    { activeUsers: 0, adminCount: 0, teamMemberCount: 0 },
  );

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <section className="flex items-start justify-between gap-4 flex-wrap">
          <article>
            <h1 className="type-page-title">
              {hasOrganizationMembership
                ? t('organization.users.title')
                : t('users.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasOrganizationMembership
                ? t('users.orgDescription')
                : t('users.description')}
            </p>
          </article>
          <menu className="flex items-center gap-2 flex-wrap">
            <Button
              primary
              onClick={() => dispatch(setCreateUserModal(true))}
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('users.add')}
            </Button>
          </menu>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: hasOrganizationMembership
                ? t('organization.users.active')
                : t('users.active'),
              value: activeUsers.toString(),
              icon: faUsersGear,
            },
            {
              label: hasOrganizationMembership
                ? t('organization.users.admins')
                : t('users.admins'),
              value: adminCount.toString(),
              icon: faUserTie,
            },
            {
              label: hasOrganizationMembership
                ? t('organization.users.members')
                : t('users.team'),
              value: teamMemberCount.toString(),
              icon: faBuilding,
            },
          ].map((card) => (
            <article
              key={card.label}
              className="bg-(--paper) border border-(--line) rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="type-meta">
                  {card.label}
                </p>
                <p className="type-metric mt-1">
                  {card.value}
                </p>
              </div>
              <span className="w-10 h-10 rounded-lg bg-(--ink) flex items-center justify-center text-(--paper)">
                <FontAwesomeIcon icon={card.icon} />
              </span>
            </article>
          ))}
        </section>

        <section className="bg-(--paper) border border-(--line) rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label={t('users.search')}
            placeholder={t('users.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label={t('users.role')}
            value={selectedRole}
            onChange={setSelectedRole}
            options={roleOptions}
          />
        </section>
      </header>
      <Table
        columns={usersColumns}
        data={usersList}
        showPagination={true}
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isFetching}
      />
      <CreateUserModal />
    </main>
  );
};

export default UsersPage;
