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
import { Link, useParams } from 'react-router-dom';
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

const formatDateLabel = (value?: string | Date) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { user: currentUser, updateUserModal } = useAppSelector(
    (state) => state.user,
  );
  const { user } = useAppSelector((state) => state.auth);
  const [isCopied, setIsCopied] = useState(false);
  useDocumentTitle('User Details');

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
      label: 'Account Status',
      value: currentUser?.status ?? '—',
      icon: faShieldHalved,
    },
    {
      label: 'Active Roles',
      value: roles.length ? roles.length.toString() : '—',
      icon: faIdBadge,
    },
    {
      label: 'Orders',
      value: currentUser?.orders?.length?.toString() ?? '—',
      icon: faChartLine,
    },
  ];

  if (isFetching && !currentUser) {
    return (
      <main className="relative w-full flex flex-col gap-6 max-w-6xl mx-auto px-4 sm:px-6">
        <span className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(95,149,152,0.18),_transparent_65%)]" />

        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
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
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.35)]"
            >
              <section className="flex flex-col gap-3">
                <SkeletonLoader type="text" width="8rem" height="0.75rem" />
                <SkeletonLoader type="text" width="4rem" height="1.75rem" />
              </section>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)]">
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
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 flex items-center gap-3"
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

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)]">
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
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            User Details
          </p>
          <h1 className="mt-2 text-2xl font-medium text-slate-900">
            User not found
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            The selected user could not be loaded.
          </p>
          <Link
            to="/users"
            className="inline-flex items-center gap-2 mt-6 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to users
          </Link>
        </section>
      </main>
    );
  }

  return (
    <motion.main
      className="relative w-full flex flex-col gap-6 max-w-6xl mx-auto px-4 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(95,149,152,0.18),_transparent_65%)]" />

      <motion.section
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]"
        variants={itemVariants}
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />

        <header className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <section className="flex items-center gap-5">
            <figure className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white flex items-center justify-center text-2xl font-medium shadow-lg">
              <FontAwesomeIcon icon={faUser} />
            </figure>
            <section>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                User Profile
              </p>
              <h1 className="mt-2 text-2xl font-medium text-slate-900 sm:text-3xl">
                {currentUser?.name ?? 'Unnamed user'}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                View personal details, access roles, and organization
                memberships.
              </p>
            </section>
          </section>
          <aside className="flex flex-wrap items-center gap-3">
            <Link
              to="/users"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 hover:bg-slate-50"
            >
              Back to list
            </Link>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              {currentUser?.status ?? 'Status Unavailable'}
            </span>
            {(['ADMIN', 'BUSINESS'].some((role) =>
              user?.userRoles?.some((userRole) => userRole.role.name === role),
            ) ||
              user?.id === currentUser?.id) && (
              <Button
                primary
                className="flex items-center gap-2"
                onClick={() => {
                  if (currentUser) {
                    dispatch(setSelectedUser(currentUser));
                  }
                  dispatch(setUpdateUserModal(true));
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                Edit User
              </Button>
            )}
          </aside>
        </header>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.35)]"
          >
            <header className="flex items-center justify-between">
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-medium text-slate-900">
                  {stat.value}
                </p>
              </section>
              <span className="h-11 w-11 rounded-xl bg-primary-50 text-primary-900 flex items-center justify-center">
                <FontAwesomeIcon icon={stat.icon} />
              </span>
            </header>
          </article>
        ))}
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <article className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)]">
          <header className="flex items-center justify-between gap-4">
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Personal Details
              </p>
              <h2 className="mt-2 text-lg font-medium text-slate-900">
                User Information
              </h2>
            </section>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Updated {formatDateLabel(currentUser?.updatedAt)}
            </span>
          </header>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                label: 'Full Name',
                value: currentUser?.name ?? '—',
                icon: faIdBadge,
              },
              {
                label: 'Email Address',
                value: currentUser?.email ?? '—',
                icon: faEnvelope,
              },
              {
                label: 'Phone Number',
                value: currentUser?.phoneNumber ?? '—',
                icon: faPhone,
              },
              {
                label: 'Date of Birth',
                value: formatDateLabel(currentUser?.dateOfBirth),
                icon: faCalendarDay,
              },
              {
                label: 'Nationality',
                value: currentUser?.nationality ?? '—',
                icon: faFlag,
              },
              {
                label: 'Member Since',
                value: formatDateLabel(currentUser?.createdAt),
                icon: faBriefcase,
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-white text-primary-900 shadow-sm flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {item.value}
                    </p>
                  </section>
                </header>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)]">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Access & Membership
            </p>
            <h2 className="mt-2 text-lg font-medium text-slate-900">
              Roles & Organizations
            </h2>
          </header>

          <section className="mt-6 flex flex-col gap-5">
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Assigned Roles
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {roles.length ? (
                  roles.map((role) => (
                    <li key={role}>
                      <span className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary-900">
                        {role}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No roles assigned.</li>
                )}
              </ul>
            </section>

            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Organizations
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {organizations.length ? (
                  organizations.map((org) => (
                    <li
                      key={org}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                    >
                      <section>
                        <p className="text-sm font-medium text-slate-900">
                          {org}
                        </p>
                        <p className="text-xs text-slate-500">
                          Active membership
                        </p>
                      </section>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                        Active
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">
                    No organization memberships.
                  </li>
                )}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-white text-primary-900 shadow-sm flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} />
              </span>
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  User ID
                </p>
                <p className="text-sm font-medium text-slate-700 break-all">
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
                      toast.success('User ID copied to clipboard');
                      navigator.clipboard.writeText(currentUser?.id || '');
                    }}
                  />
                </p>
              </section>
            </section>
          </section>
        </article>
      </motion.section>

      <UpdateUserProfileModal />
    </motion.main>
  );
};

export default UserDetailsPage;
