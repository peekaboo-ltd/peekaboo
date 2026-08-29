import { useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faShieldHalved,
  faIdBadge,
  faEnvelope,
  faPhone,
  faCalendarDay,
  faFlag,
  faBriefcase,
  faChartLine,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import {
  faCircleCheck,
  faCopy,
  faPenToSquare,
  faUser,
} from '@fortawesome/free-regular-svg-icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/inputs/Button';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setSelectedUser,
  setUpdateUserModal,
} from '@/states/slices/user.slice';
import UpdateUserProfileModal from './UpdateUserProfileModal';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchUserById } from '@/hooks/users/users.hooks';
import { toast } from 'sonner';
import { SkeletonLoader } from '@/components/inputs/Loader';
import { useI18n, type Language } from '@/i18n/i18n';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 1, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const formatDateLabel = (value: string | Date | undefined, language: Language) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(language === 'fr' ? 'fr-RW' : language === 'rw' ? 'rw-RW' : 'en-RW', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const UserDetailsPage = () => {
  const { t, language } = useI18n();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { user: currentUser, updateUserModal } = useAppSelector(
    (state) => state.user,
  );
  const { user } = useAppSelector((state) => state.auth);
  const [isCopied, setIsCopied] = useState(false);
  useDocumentTitle(t('userDetails.docTitle'));

  // NAVIGATION
  const navigate = useNavigate();

  const { fetchUserById, isFetching } = useFetchUserById();

  useEffect(() => {
    if (id && !updateUserModal) {
      fetchUserById(id);
    }
  }, [id, fetchUserById, updateUserModal]);

  const roles = useMemo(() => {
    return (
      currentUser?.userRoles
        ?.map((userRole) => userRole.role?.name)
        .filter(Boolean) ?? []
    );
  }, [currentUser?.userRoles]);

  const organizations = useMemo(() => {
    return (
      currentUser?.organizationMembership
        ?.map((membership) => membership.organization?.name)
        .filter(Boolean) ?? []
    );
  }, [currentUser?.organizationMembership]);

  const stats = [
    {
      label: t('profile.accountStatus'),
      value: currentUser?.status ? t(`status.${currentUser.status.toLowerCase()}`) : '—',
      icon: faShieldHalved,
    },
    {
      label: t('profile.activeRoles'),
      value: roles.length ? roles.length.toString() : '—',
      icon: faIdBadge,
    },
    {
      label: t('profile.orders'),
      value: currentUser?.orders?.length?.toString() ?? '—',
      icon: faChartLine,
    },
  ];

  if (isFetching && !currentUser) {
    return (
      <main className="w-full flex flex-col gap-6 mx-auto">
        <section className="border border-(--line) bg-(--paper) p-6">
          <header className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <section className="flex items-center gap-5">
              <SkeletonLoader width="4rem" height="4rem" />
              <section className="flex flex-col gap-2">
                <SkeletonLoader type="text" width="9rem" height="0.75rem" />
                <SkeletonLoader type="text" width="16rem" height="2rem" />
                <SkeletonLoader type="text" width="20rem" height="1rem" />
              </section>
            </section>
            <section className="flex items-center gap-3">
              <SkeletonLoader type="button" width="7rem" height="2rem" />
              <SkeletonLoader type="button" width="8rem" height="2rem" />
            </section>
          </header>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={`stat-skeleton-${index}`}
              className="rounded-md border border-(--line) bg-(--paper) p-5"
            >
              <section className="flex flex-col gap-3">
                <SkeletonLoader type="text" width="8rem" height="0.75rem" />
                <SkeletonLoader type="text" width="4rem" height="1.75rem" />
              </section>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="lg:col-span-2 rounded-md border border-(--line) bg-(--paper) p-6">
            <section className="flex items-center justify-between gap-4">
              <section className="flex flex-col gap-2">
                <SkeletonLoader type="text" width="10rem" height="0.75rem" />
                <SkeletonLoader type="text" width="12rem" height="1.25rem" />
              </section>
              <SkeletonLoader type="text" width="8rem" height="0.75rem" />
            </section>
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <section
                  key={`detail-skeleton-${index}`}
                  className="rounded-xl bg-(--surface) p-4 flex items-center gap-3"
                >
                  <SkeletonLoader width="2.25rem" height="2.25rem" />
                  <section className="flex flex-col gap-2 w-full">
                    <SkeletonLoader type="text" width="7rem" height="0.75rem" />
                    <SkeletonLoader type="text" width="11rem" height="1rem" />
                  </section>
                </section>
              ))}
            </section>
          </article>

          <article className="rounded-md border border-(--line) bg-(--paper) p-6">
            <section className="flex flex-col gap-2">
              <SkeletonLoader type="text" width="8rem" height="0.75rem" />
              <SkeletonLoader type="text" width="12rem" height="1.25rem" />
            </section>
            <section className="mt-6 flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonLoader
                  key={`side-skeleton-${index}`}
                  width="100%"
                  height="2.75rem"
                />
              ))}
            </section>
          </article>
        </section>
      </main>
    );
  }

  if (!isFetching && !currentUser) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <section className="rounded-md border border-(--line) bg-(--paper) p-8 text-center">
          <p className="text-sm text-(--muted)">
            {t('userDetails.docTitle')}
          </p>
          <h1 className="type-page-title mt-2">
            {t('userDetails.notFound')}
          </h1>
          <p className="mt-3 text-sm text-(--muted)">
            {t('userDetails.notFoundDescription')}
          </p>
          <Link
            to="/users"
            className="inline-flex items-center gap-2 mt-6 rounded-md px-4 py-2 text-sm text-(--ink) hover:bg-(--surface)"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {t('userDetails.backUsers')}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <motion.main
      className="w-full flex flex-col gap-6 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        className="rounded-md border border-(--line) bg-(--paper) p-6"
        variants={itemVariants}
      >
        <header className="flex flex-col gap-6 lg:flex-row rounded-md lg:items-center lg:justify-between">
          <section className="flex items-center gap-5">
            <figure className="h-16 w-16 rounded-full bg-(--surface) text-(--ink) flex items-center justify-center text-2xl font-normal">
              <FontAwesomeIcon icon={faUser} />
            </figure>
            <section>
              <p className="type-meta">
                {t('userDetails.profile')}
              </p>
              <h1 className="type-page-title mt-2 text-(--ink)">
                {currentUser?.name ?? t('userDetails.unnamed')}
              </h1>
              <p className="mt-2 text-sm text-(--muted) sm:text-base">
                {t('userDetails.description')}
              </p>
            </section>
          </section>
          <aside className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-(--line) bg-(--paper) px-3 py-1 text-xs font-normal text-(--muted)">
              {currentUser?.status
                ? t(`status.${currentUser.status.toLowerCase()}`)
                : t('userDetails.statusUnavailable')}
            </span>
            {(['ADMIN', 'BUSINESS'].some((role) =>
              user?.userRoles?.some((userRole) => userRole.role.name === role),
            ) ||
              user?.id === currentUser?.id) && (
              <Button
                primary
                onClick={() => {
                  if (currentUser) {
                    dispatch(setSelectedUser(currentUser));
                  }
                  dispatch(setUpdateUserModal(true));
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                {t('userDetails.edit')}
              </Button>
            )}
          </aside>
        </header>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats?.map((stat) => (
          <article
            key={stat?.label}
            className="rounded-md border border-(--line) bg-(--paper) p-5"
          >
            <header className="flex items-center justify-between">
              <section>
                <p className="type-meta">
                  {stat?.label}
                </p>
                <p className="type-card-title mt-3">
                  {stat?.value}
                </p>
              </section>
              <span className="h-9 w-9 rounded-full bg-(--surface) text-(--ink) flex items-center justify-center">
                <FontAwesomeIcon icon={stat?.icon} />
              </span>
            </header>
          </article>
        ))}
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <article className="lg:col-span-2 rounded-md border border-(--line) bg-(--paper) p-6">
          <header className="flex items-center justify-between gap-4">
            <section>
              <p className="type-meta">
                {t('profile.personalDetails')}
              </p>
              <h2 className="type-card-title mt-2">
                {t('profile.information')}
              </h2>
            </section>
            <span className="type-meta">
              {t('profile.updated', { date: formatDateLabel(currentUser?.updatedAt, language) })}
            </span>
          </header>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                label: t('profile.fullName'),
                value: currentUser?.name ?? '—',
                icon: faIdBadge,
              },
              {
                label: t('profile.email'),
                value: currentUser?.email ?? '—',
                icon: faEnvelope,
              },
              {
                label: t('profile.phone'),
                value: currentUser?.phoneNumber ?? '—',
                icon: faPhone,
              },
              {
                label: t('profile.birthDate'),
                value: formatDateLabel(currentUser?.dateOfBirth, language),
                icon: faCalendarDay,
              },
              {
                label: t('profile.nationality'),
                value: currentUser?.nationality ?? '—',
                icon: faFlag,
              },
              {
                label: t('profile.memberSince'),
                value: formatDateLabel(currentUser?.createdAt, language),
                icon: faBriefcase,
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-md bg-(--surface) p-4"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="type-meta">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-normal text-(--ink)">
                      {item.value}
                    </p>
                  </section>
                </header>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-md border border-(--line) bg-(--paper) p-6">
          <header>
            <p className="type-meta">
              {t('profile.access')}
            </p>
            <h2 className="type-card-title mt-2">
              {t('profile.rolesOrganizations')}
            </h2>
          </header>

          <section className="mt-6 flex flex-col gap-5">
            <section>
              <p className="type-meta">
                {t('profile.assignedRoles')}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {roles.length ? (
                  roles.map((role) => (
                    <li key={role}>
                      <span className="rounded-full border border-(--line) bg-(--paper) px-3 py-1 text-xs font-normal text-(--ink)">
                        {t(`role.${role.toLowerCase()}`)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-(--muted)">{t('profile.noRoles')}</li>
                )}
              </ul>
            </section>

            <section>
              <p className="type-meta">
                {t('profile.organizations')}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {organizations.length ? (
                  organizations.map((org) => (
                    <li
                      key={org}
                      className="flex items-center justify-between rounded-md bg-(--surface) px-4 py-3"
                    >
                      <section>
                        <p className="text-sm font-normal text-(--ink)">
                          {org}
                        </p>
                        <p className="type-meta">
                          {t('profile.activeMembership')}
                        </p>
                      </section>
                      <span className="rounded-full border border-(--line) bg-(--paper) px-2.5 py-1 text-xs font-normal text-(--ink)">
                        {t('status.active')}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-(--muted)">
                    {t('profile.noOrganizations')}
                  </li>
                )}
              </ul>
            </section>

            <section className="rounded-md bg-(--surface) p-4 flex items-center gap-3">
              <span className="h-9 w-9 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} />
              </span>
              <section>
                <p className="type-meta">
                  {t('profile.userId')}
                </p>
                <p className="text-sm font-normal text-(--ink) break-all">
                  {currentUser?.id ?? '—'}{' '}
                  <FontAwesomeIcon
                    className="cursor-pointer"
                    icon={isCopied ? faCircleCheck : faCopy}
                    onClick={(e) => {
                      e.preventDefault();
                      setTimeout(() => {
                        setIsCopied(false);
                      }, 1000);
                      setIsCopied(true);
                      toast.success(t('profile.userIdCopied'));
                      void navigator.clipboard.writeText(currentUser?.id || '');
                    }}
                  />
                </p>
              </section>
            </section>
          </section>
        </article>
        <menu className='w-full flex items-center gap-3 justify-between'>
          <Button type='button' onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}>
            {t('common.actions.back')}
          </Button>
        </menu>
      </motion.section>

      <UpdateUserProfileModal />
    </motion.main>
  );
};

export default UserDetailsPage;
