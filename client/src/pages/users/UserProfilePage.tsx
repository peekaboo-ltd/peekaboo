import { useEffect, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faIdBadge,
  faEnvelope,
  faPhone,
  faCalendarDay,
  faFlag,
  faBriefcase,
  faChartLine,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/inputs/Button';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setSelectedUser,
  setUpdateUserModal,
  setUserDefaultLocationModal,
} from '@/states/slices/user.slice';
import UpdateUserProfileModal from './UpdateUserProfileModal';
import SetUserDefaultLocationModal from './SetUserDefaultLocationModal';
import { faPenToSquare, faUser } from '@fortawesome/free-regular-svg-icons';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfilePhotoUrl } from '@/utils/profilePhoto.util';

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

const UserProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { selectedUser } = useAppSelector((state) => state.user);
  useDocumentTitle('Profile');

  const navigate = useNavigate();

  useEffect(() => {
    if (authUser && (!selectedUser || selectedUser.id !== authUser.id)) {
      dispatch(setSelectedUser(authUser));
    }
  }, [authUser, selectedUser, dispatch]);

  const roles = useMemo(() => {
    return (
      selectedUser?.userRoles
        ?.map((userRole) => userRole.role?.name)
        .filter(Boolean) ?? []
    );
  }, [selectedUser?.userRoles]);

  const organizations = useMemo(() => {
    return (
      selectedUser?.organizationMembership
        ?.map((membership) => membership.organization?.name)
        .filter(Boolean) ?? []
    );
  }, [selectedUser?.organizationMembership]);

  const stats = [
    {
      label: 'Account Status',
      value: selectedUser?.status ?? '—',
      icon: faShieldHalved,
      iconBg: 'bg-primary-50 text-primary-900',
    },
    {
      label: 'Active Roles',
      value: roles.length ? roles.length.toString() : '—',
      icon: faIdBadge,
      iconBg: 'bg-secondary-50 text-secondary-800',
    },
    {
      label: 'Orders',
      value: selectedUser?.orders?.length?.toString() ?? '—',
      icon: faChartLine,
      iconBg: 'bg-primary-50 text-primary-900',
    },
  ];

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

      {/* Header card */}
      <motion.section
        className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        variants={itemVariants}
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary-200/40 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-primary-200/30 blur-3xl" />

        <header className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <section className="flex items-center gap-5">
            <Avatar className="h-16 w-16 rounded-2xl border-2 border-slate-100 shadow-md overflow-hidden">
              <AvatarImage
                src={selectedUser?.profilePhotoUrl ? getProfilePhotoUrl(selectedUser.profilePhotoUrl) ?? undefined : undefined}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-900 text-white text-2xl font-medium">
                <FontAwesomeIcon icon={faUser} />
              </AvatarFallback>
            </Avatar>
            <section>
              <p className="text-xs uppercase tracking-[0.28em] text-secondary-700 font-medium">
                Profile Overview
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#25343F] sm:text-3xl">
                {selectedUser?.name ?? 'Your Profile'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Keep your personal details, roles, and contact information current.
              </p>
            </section>
          </section>
          <aside className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              {selectedUser?.status ?? 'Status Unavailable'}
            </span>
            <Button
              primary
              className="flex items-center gap-2"
              onClick={() => {
                if (selectedUser) {
                  dispatch(setSelectedUser(selectedUser));
                }
                dispatch(setUpdateUserModal(true));
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              Edit Profile
            </Button>
          </aside>
        </header>
      </motion.section>

      {/* Stats */}
      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <header className="flex items-center justify-between">
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-xl font-semibold text-[#25343F]">
                  {stat.value}
                </p>
              </section>
              <span className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                <FontAwesomeIcon icon={stat.icon} />
              </span>
            </header>
          </article>
        ))}
      </motion.section>

      {/* Details + Roles */}
      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <article className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary-700 font-medium">
                Personal Details
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#25343F]">
                Profile Information
              </h2>
            </section>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Updated {formatDateLabel(selectedUser?.updatedAt)}
            </span>
          </header>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Full Name', value: selectedUser?.name ?? '—', icon: faIdBadge },
              { label: 'Email Address', value: selectedUser?.email ?? '—', icon: faEnvelope },
              { label: 'Phone Number', value: selectedUser?.phoneNumber ?? '—', icon: faPhone },
              { label: 'Date of Birth', value: formatDateLabel(selectedUser?.dateOfBirth), icon: faCalendarDay },
              { label: 'Nationality', value: selectedUser?.nationality ?? '—', icon: faFlag },
              { label: 'Member Since', value: formatDateLabel(selectedUser?.createdAt), icon: faBriefcase },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-secondary-50 text-secondary-800 shadow-sm flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#25343F]">
                      {item.value}
                    </p>
                  </section>
                </header>
              </li>
            ))}

            <li className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:col-span-2">
              <header className="flex items-center justify-between gap-3">
                <section className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-secondary-50 text-secondary-800 shadow-sm flex items-center justify-center">
                    <FontAwesomeIcon icon={faLocationDot} />
                  </span>
                  <section>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Default Pickup Location
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#25343F]">
                      {selectedUser?.defaultLocation
                        ? `${selectedUser.defaultLocation.latitude.toFixed(5)}, ${selectedUser.defaultLocation.longitude.toFixed(5)}`
                        : '—'}
                    </p>
                  </section>
                </section>
                <Link
                  to={`#`}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setUserDefaultLocationModal(true));
                  }}
                  className="text-xs font-medium text-secondary-700 hover:underline underline-offset-2 shrink-0"
                >
                  {selectedUser?.defaultLocation ? 'Update' : 'Set Location'}
                </Link>
              </header>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-700 font-medium">
              Access & Membership
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#25343F]">
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
                      <span className="rounded-full border border-secondary-100 bg-secondary-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-800">
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
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <section>
                        <p className="text-sm font-medium text-[#25343F]">{org}</p>
                        <p className="text-xs text-slate-500">Active membership</p>
                      </section>
                      <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-secondary-800">
                        Active
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No organization memberships.</li>
                )}
              </ul>
            </section>
          </section>
        </article>

        <menu className="w-full flex items-center gap-3 justify-between">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
        </menu>
      </motion.section>

      <UpdateUserProfileModal />
      <SetUserDefaultLocationModal />
    </motion.main>
  );
};

export default UserProfilePage;
