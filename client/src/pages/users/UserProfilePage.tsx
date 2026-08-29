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
import { useI18n, type Language } from '@/i18n/i18n';

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

const UserProfilePage = () => {
  const { t, language } = useI18n();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { selectedUser } = useAppSelector((state) => state.user);
  useDocumentTitle(t('profile.docTitle'));

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
      label: t('profile.accountStatus'),
      value: selectedUser?.status ? t(`status.${selectedUser.status.toLowerCase()}`) : '—',
      icon: faShieldHalved,
      iconBg: 'bg-(--ink) text-(--paper)',
    },
    {
      label: t('profile.activeRoles'),
      value: roles.length ? roles.length.toString() : '—',
      icon: faIdBadge,
      iconBg: 'bg-(--surface) text-(--muted)',
    },
    {
      label: t('profile.orders'),
      value: selectedUser?.orders?.length?.toString() ?? '—',
      icon: faChartLine,
      iconBg: 'bg-(--ink) text-(--paper)',
    },
  ];

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow={t('profile.overview')}
          title={selectedUser?.name ?? t('profile.yours')}
          description={t('profile.description')}
          actions={
            <>
              <span className="rounded-full border border-(--line) bg-(--paper) px-3 py-1 text-xs font-normal text-(--muted)">
                {selectedUser?.status
                  ? t(`status.${selectedUser.status.toLowerCase()}`)
                  : t('userDetails.statusUnavailable')}
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
                {t('profile.updateTitle')}
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
          eyebrow={t('profile.personalDetails')}
          title={t('profile.information')}
          actions={
            <span className="type-meta">
              {t('profile.updated', { date: formatDateLabel(selectedUser?.updatedAt, language) })}
            </span>
          }
        >
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: t('profile.fullName'), value: selectedUser?.name ?? '—', icon: faIdBadge },
              { label: t('profile.email'), value: selectedUser?.email ?? '—', icon: faEnvelope },
              { label: t('profile.phone'), value: selectedUser?.phoneNumber ?? '—', icon: faPhone },
              { label: t('profile.birthDate'), value: formatDateLabel(selectedUser?.dateOfBirth, language), icon: faCalendarDay },
              { label: t('profile.nationality'), value: selectedUser?.nationality ?? '—', icon: faFlag },
              { label: t('profile.memberSince'), value: formatDateLabel(selectedUser?.createdAt, language), icon: faBriefcase },
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

            <li className="rounded-md bg-(--surface) p-4 sm:col-span-2">
              <header className="flex items-center justify-between gap-3">
                <section className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center">
                    <FontAwesomeIcon icon={faLocationDot} />
                  </span>
                  <section>
                    <p className="type-meta">
                      {t('profile.defaultPickup')}
                    </p>
                    <p className="mt-1 text-sm font-normal text-(--ink)">
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
                  className="text-xs font-normal text-(--muted) hover:underline underline-offset-2 shrink-0"
                >
                  {selectedUser?.defaultLocation
                    ? t('profile.updateLocation')
                    : t('profile.setLocation')}
                </Link>
              </header>
            </li>
          </ul>
        </InternalSectionCard>

        <InternalSectionCard
          eyebrow={t('profile.access')}
          title={t('profile.rolesOrganizations')}
        >
          <section className="mt-6 flex flex-col gap-5">
            <section>
              <p className="type-meta">
                {t('profile.assignedRoles')}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {roles.length ? (
                  roles.map((role) => (
                    <li key={role}>
                      <span className="rounded-full bg-(--surface) px-3 py-1 text-xs font-normal text-(--muted)">
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
                        <p className="text-sm font-normal text-(--ink)">{org}</p>
                        <p className="type-meta">{t('profile.activeMembership')}</p>
                      </section>
                      <span className="rounded-full bg-(--surface) px-2.5 py-1 text-xs font-normal text-(--muted)">
                        {t('status.active')}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-(--muted)">{t('profile.noOrganizations')}</li>
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
            {t('common.actions.back')}
          </Button>
        </menu>
      </motion.section>

      <UpdateUserProfileModal />
      <SetUserDefaultLocationModal />
    </InternalPage>
  );
};

export default UserProfilePage;
