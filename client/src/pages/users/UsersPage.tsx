import Table from '@/components/table/Table';
import { useUsersColumns } from '@/hooks/users/columns.users';
import { useFetchUsers } from '@/hooks/users/users.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { useEffect } from 'react';
import CreateUserModal from './CreateUserModal';
import { setCreateUserModal } from '@/states/slices/user.slice';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faUsersGear, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';
import { RoleTypes } from '@/types/auth.type';

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const { usersList, createUserModal } = useAppSelector((state) => state.user);

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

  useEffect(() => {
    if (!createUserModal) {
      fetchUsers({ page, size });
    }
  }, [fetchUsers, page, size, createUserModal]);

  const { usersColumns } = useUsersColumns();
  const { t } = useI18n();

  const { activeUsers, adminCount, teamMemberCount } = usersList.reduce(
    (acc, user) => {
      if (user.status === 'ACTIVE') acc.activeUsers += 1;
      const roles = user.userRoles?.map((userRole) => userRole.role?.name) || [];
      if (roles.includes(RoleTypes.ADMIN)) acc.adminCount += 1;
      if (roles.includes(RoleTypes.STAFF) || roles.includes(RoleTypes.BUSINESS)) {
        acc.teamMemberCount += 1;
      }
      return acc;
    },
    { activeUsers: 0, adminCount: 0, teamMemberCount: 0 }
  );

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <section className="flex items-start justify-between gap-4 flex-wrap">
          <article>
            <h1 className="text-2xl font-bold text-primary-900">
              {t('organization.users.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage team access, roles, and status for your organization.
            </p>
          </article>
          <Button
            primary
            onClick={() => dispatch(setCreateUserModal(true))}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add User
          </Button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: t('organization.users.active'),
              value: activeUsers.toString(),
              icon: faUsersGear,
            },
            {
              label: t('organization.users.admins'),
              value: adminCount.toString(),
              icon: faUserTie,
            },
            {
              label: t('organization.users.members'),
              value: teamMemberCount.toString(),
              icon: faBuilding,
            },
          ].map((card) => (
            <article
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{card.value}</p>
              </div>
              <span className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <FontAwesomeIcon icon={card.icon} />
              </span>
            </article>
          ))}
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
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <article>
          <h2 className="text-base font-semibold text-slate-900">{t('organization.users.ctaTitle')}</h2>
          <p className="text-sm text-slate-600">
            {t('organization.users.ctaSubtitle')}
          </p>
        </article>
        <Button route="/onboarding/organization" className="px-5" primary>
          {t('home.b2b.pricing.cta')}
        </Button>
      </section>
      <CreateUserModal />
    </main>
  );
};

export default UsersPage;
