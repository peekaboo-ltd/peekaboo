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
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { Link, useNavigate } from 'react-router-dom';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
  InternalStatCard,
} from '@/components/layout/InternalPage';

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
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
      iconBg: 'bg-(--ink) text-(--ink)',
    },
    {
      label: 'Active Roles',
      value: roles.length ? roles.length.toString() : '—',
      icon: faIdBadge,
      iconBg: 'bg-(--surface) text-(--muted)',
    },
    {
      label: 'Orders',
      value: selectedUser?.orders?.length?.toString() ?? '—',
      icon: faChartLine,
      iconBg: 'bg-(--ink) text-(--ink)',
    },
  ];

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Profile Overview"
          title={selectedUser?.name ?? 'Your Profile'}
          description="Keep your personal details, roles, and contact information current."
          actions={
            <>
              <span className="rounded-full border border-(--line) bg-(--paper) px-3 py-1 text-xs font-medium text-(--muted)">
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
            </>
          }
        />
      </motion.section>

      {/* Stats */}
      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <InternalStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={<FontAwesomeIcon icon={stat.icon} />}
          />
        ))}
      </motion.section>

      {/* Details + Roles */}
      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <InternalSectionCard
          className="lg:col-span-2"
          eyebrow="Personal Details"
          title="Profile Information"
          actions={
            <span className="text-xs text-(--muted)">
              Updated {formatDateLabel(selectedUser?.updatedAt)}
            </span>
          }
        >
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
                className="rounded-lg border border-(--line) bg-(--surface) p-4"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="text-xs text-(--muted)">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-(--ink)">
                      {item.value}
                    </p>
                  </section>
                </header>
              </li>
            ))}

            <li className="rounded-lg border border-(--line) bg-(--surface) p-4 sm:col-span-2">
              <header className="flex items-center justify-between gap-3">
                <section className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center">
                    <FontAwesomeIcon icon={faLocationDot} />
                  </span>
                  <section>
                    <p className="text-xs text-(--muted)">
                      Default Pickup Location
                    </p>
                    <p className="mt-1 text-sm font-medium text-(--ink)">
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
                  className="text-xs font-medium text-(--muted) hover:underline underline-offset-2 shrink-0"
                >
                  {selectedUser?.defaultLocation ? 'Update' : 'Set Location'}
                </Link>
              </header>
            </li>
          </ul>
        </InternalSectionCard>

        <InternalSectionCard
          eyebrow="Access & Membership"
          title="Roles & Organizations"
        >
          <section className="mt-6 flex flex-col gap-5">
            <section>
              <p className="text-xs text-(--muted)">
                Assigned Roles
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {roles.length ? (
                  roles.map((role) => (
                    <li key={role}>
                      <span className="rounded-full border border-(--line) bg-(--surface) px-3 py-1 text-xs font-medium text-(--muted)">
                        {role}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-(--muted)">No roles assigned.</li>
                )}
              </ul>
            </section>

            <section>
              <p className="text-xs text-(--muted)">
                Organizations
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {organizations.length ? (
                  organizations.map((org) => (
                    <li
                      key={org}
                      className="flex items-center justify-between rounded-lg border border-(--line) bg-(--surface) px-4 py-3"
                    >
                      <section>
                        <p className="text-sm font-medium text-(--ink)">{org}</p>
                        <p className="text-xs text-(--muted)">Active membership</p>
                      </section>
                      <span className="rounded-full bg-(--surface) px-2.5 py-1 text-[11px] font-medium text-(--muted)">
                        Active
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-(--muted)">No organization memberships.</li>
                )}
              </ul>
            </section>
          </section>
        </InternalSectionCard>

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
    </InternalPage>
  );
};

export default UserProfilePage;
