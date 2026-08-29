import { useCallback, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faEnvelope,
  faPhone,
  faLocationDot,
  faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { useFetchMyOrganizationQuery } from '@/api/queries/organization.queries';
import { useUpdateMyOrganization } from '@/hooks/organization/organization.hooks';
import Modal from '@/components/Modal';
import PlaceSearch, { type PlaceSearchResult } from '@/components/inputs/PlaceSearch';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
} from '@/components/layout/InternalPage';
import { useI18n } from '@/i18n/i18n';

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const OrganizationSettingsPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('organization.settingsDocTitle'));

  const { data: orgResponse, isLoading, refetch } = useFetchMyOrganizationQuery();
  const { updateMyOrganization, isLoading: isUpdating, isSuccess } =
    useUpdateMyOrganization();

  const organization = orgResponse?.data;

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<PlaceSearchResult | null>(null);

  const handleCloseLocationModal = useCallback(() => {
    setSelectedLocation(null);
    setLocationModalOpen(false);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      handleCloseLocationModal();
    }
  }, [isSuccess, refetch, handleCloseLocationModal]);

  const handleSaveLocation = () => {
    if (!selectedLocation) return;
    updateMyOrganization({
      defaultLocation: {
        latitude: selectedLocation.coordinates.latitude,
        longitude: selectedLocation.coordinates.longitude,
      },
    });
  };

  const details = organization
    ? [
        {
          label: t('organization.name'),
          value: organization.name,
          icon: faBuilding,
        },
        {
          label: t('organization.emailLabel'),
          value: organization.email ?? '—',
          icon: faEnvelope,
        },
        {
          label: t('organization.phone'),
          value: organization.phoneNumber ?? '—',
          icon: faPhone,
        },
        {
          label: t('organization.address'),
          value: organization.address ?? '—',
          icon: faMapPin,
        },
      ]
    : [];

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow={t('organization.settings')}
          title={isLoading ? t('common.loading') : (organization?.name ?? t('organization.myOrganization'))}
          description={t('organization.settingsDescription')}
        />
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <InternalSectionCard
          className="lg:col-span-2"
          eyebrow={t('organization.generalInformation')}
          title={t('organization.details')}
        >
          {isLoading ? (
            <section className="mt-6 flex items-center gap-3 text-(--muted)">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-(--ink)" />
              <span className="text-sm">{t('organization.loading')}</span>
            </section>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {details.map((item) => (
                <li
                  key={item.label}
                  className="rounded-lg bg-(--surface) p-4"
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
          )}
        </InternalSectionCard>

        <InternalSectionCard
          eyebrow={t('organization.location')}
          title={t('organization.defaultPickup')}
          description={t('organization.defaultPickupDescription')}
        >
          <section className="mt-6">
            {organization?.defaultLocation ? (
              <aside className="p-4 rounded-lg bg-(--surface) space-y-2">
                <header className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-(--ink) text-sm"
                  />
                  <p className="type-meta">
                    {t('organization.currentDefault')}
                  </p>
                </header>
                <p className="text-sm font-normal text-(--ink)">
                  {organization.defaultLocation.latitude.toFixed(5)},{' '}
                  {organization.defaultLocation.longitude.toFixed(5)}
                </p>
              </aside>
            ) : (
              <p className="text-sm text-(--muted)">{t('organization.noDefault')}</p>
            )}

              <Button
              primary
              onClick={() => setLocationModalOpen(true)}
              className="mt-4 w-full flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faLocationDot} />
              {organization?.defaultLocation ? t('organization.updateLocation') : t('organization.setLocation')}
            </Button>
          </section>
        </InternalSectionCard>
      </motion.section>

      <Modal
        isOpen={locationModalOpen}
        onClose={handleCloseLocationModal}
        className="top-[42%] translate-y-[-42%] sm:top-[50%] sm:translate-y-[-50%]"
        heading={t('organization.defaultPickup')}
        description={t('organization.setLocationDescription')}
      >
        <article className="space-y-6">
          <section className="space-y-4">
            <header>
              <h4 className="type-card-title">{t('organization.searchLocation')}</h4>
              <p className="text-sm text-(--muted)">
                {t('organization.searchLocationHelp')}
              </p>
            </header>

            <PlaceSearch
              onLocationSelect={setSelectedLocation}
              placeholder={t('organization.searchLocationPlaceholder')}
              className="relative"
              country="rw"
            />
          </section>

          {selectedLocation && (
            <aside className="p-4 bg-(--surface) rounded-lg border">
              <h5 className="text-sm font-normal text-(--ink) mb-2">
                {t('organization.selectedLocation')}
              </h5>
              <address className="text-sm text-(--ink) not-italic">
                <strong>{selectedLocation.name}</strong>
                <br />
                {selectedLocation.formattedAddress}
              </address>
            </aside>
          )}

          <footer className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button onClick={handleCloseLocationModal} className="px-6 py-2">
              {t('common.actions.cancel')}
            </Button>
            <Button
              onClick={handleSaveLocation}
              disabled={!selectedLocation || isUpdating}
              isLoading={isUpdating}
              primary
              className="px-6 py-2"
            >
              {t('organization.saveLocation')}
            </Button>
          </footer>
        </article>
      </Modal>
    </InternalPage>
  );
};

export default OrganizationSettingsPage;
