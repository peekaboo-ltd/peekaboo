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

const OrganizationSettingsPage = () => {
  useDocumentTitle('Organization Settings');

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
          label: 'Organization Name',
          value: organization.name,
          icon: faBuilding,
        },
        {
          label: 'Email',
          value: organization.email ?? '—',
          icon: faEnvelope,
        },
        {
          label: 'Phone Number',
          value: organization.phoneNumber ?? '—',
          icon: faPhone,
        },
        {
          label: 'Address',
          value: organization.address ?? '—',
          icon: faMapPin,
        },
      ]
    : [];

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Organization Settings"
          title={isLoading ? 'Loading…' : (organization?.name ?? 'My Organization')}
          description="Manage your organization's details and default pickup location."
        />
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <InternalSectionCard
          className="lg:col-span-2"
          eyebrow="General Information"
          title="Organization Details"
        >
          {isLoading ? (
            <section className="mt-6 flex items-center gap-3 text-slate-500">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
              <span className="text-sm">Loading organization…</span>
            </section>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {details.map((item) => (
                <li
                  key={item.label}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <header className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center">
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
          )}
        </InternalSectionCard>

        <InternalSectionCard
          eyebrow="Location"
          title="Default Pickup Location"
          description="This location will be offered as the default pickup point when members of your organization create orders."
        >
          <section className="mt-6">
            {organization?.defaultLocation ? (
              <aside className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <header className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-slate-700 text-sm"
                  />
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Current Default
                  </p>
                </header>
                <p className="text-sm font-medium text-slate-900">
                  {organization.defaultLocation.latitude.toFixed(5)},{' '}
                  {organization.defaultLocation.longitude.toFixed(5)}
                </p>
              </aside>
            ) : (
              <p className="text-sm text-slate-500">No default location set.</p>
            )}

              <Button
              primary
              onClick={() => setLocationModalOpen(true)}
              className="mt-4 w-full flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faLocationDot} />
              {organization?.defaultLocation ? 'Update Location' : 'Set Location'}
            </Button>
          </section>
        </InternalSectionCard>
      </motion.section>

      <Modal
        isOpen={locationModalOpen}
        onClose={handleCloseLocationModal}
        className="top-[42%] translate-y-[-42%] sm:top-[50%] sm:translate-y-[-50%]"
        heading="Default Pickup Location"
        description="Set the default location for orders created by your organization"
      >
        <article className="space-y-6">
          <section className="space-y-4">
            <header>
              <h4 className="text-lg font-medium text-gray-900">Search Location</h4>
              <p className="text-sm text-gray-600">
                Enter an address or place name to use as the organization's default
                pickup point
              </p>
            </header>

            <PlaceSearch
              onLocationSelect={setSelectedLocation}
              placeholder="Search for organization location..."
              className="relative"
              country="rw"
            />
          </section>

          {selectedLocation && (
            <aside className="p-4 bg-gray-50 rounded-lg border">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Selected Location:
              </h5>
              <address className="text-sm text-gray-700 not-italic">
                <strong>{selectedLocation.name}</strong>
                <br />
                {selectedLocation.formattedAddress}
              </address>
            </aside>
          )}

          <footer className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button onClick={handleCloseLocationModal} className="px-6 py-2">
              Cancel
            </Button>
            <Button
              onClick={handleSaveLocation}
              disabled={!selectedLocation || isUpdating}
              isLoading={isUpdating}
              primary
              className="px-6 py-2"
            >
              Save Location
            </Button>
          </footer>
        </article>
      </Modal>
    </InternalPage>
  );
};

export default OrganizationSettingsPage;
