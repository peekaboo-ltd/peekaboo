import Modal from '@/components/Modal';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import NearestPlace from '@/containers/locations/NearestPlace';
import LocationMiniMap from '@/components/orders/LocationMiniMap';
import type { OrderLocation } from '@/types/order.type';
import { useI18n } from '@/i18n/i18n';

export interface LocationDetail {
  label: string;
  location: OrderLocation;
}

interface LocationDetailModalProps {
  /** The location being inspected, or null when the modal is closed. */
  detail: LocationDetail | null;
  onClose: () => void;
}

/**
 * The full address for one end of the route.
 *
 * The province/district/sector breakdown is a reverse-geocode lookup that most
 * people never read — it belongs behind a click rather than inline, where it
 * pushed the map and the price below the fold. The order page keeps the
 * one-line answer; this has the rest.
 *
 * Held in local state rather than an order.slice boolean because it carries a
 * payload — which of the two locations — that a bare flag cannot express.
 */
const LocationDetailModal = ({ detail, onClose }: LocationDetailModalProps) => {
  const { t } = useI18n();
  return (
  <Modal
    isOpen={Boolean(detail)}
    onClose={onClose}
    heading={detail ? t('publicOrder.location.addressTitle', { location: detail.label }) : ''}
    description={t('publicOrder.location.description')}
  >
    {detail ? (
      <div className="flex flex-col gap-5">
        <LocationMiniMap location={detail.location} label={detail.label} />

        <section className="flex flex-col gap-2">
          <h3 className="type-eyebrow">{t('publicOrder.location.landmark')}</h3>
          <NearestPlace location={detail.location} />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="type-eyebrow">{t('publicOrder.location.adminArea')}</h3>
          <ul className='w-full grid grid-cols-2 gap-2'>
          <AdministrativeLocation location={detail.location} />
          </ul>
        </section>
      </div>
    ) : null}
  </Modal>
  );
};

export default LocationDetailModal;
