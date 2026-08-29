import Modal from '@/components/Modal';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import NearestPlace from '@/containers/locations/NearestPlace';
import LocationMiniMap from '@/components/orders/LocationMiniMap';
import type { OrderLocation } from '@/types/order.type';

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
const LocationDetailModal = ({ detail, onClose }: LocationDetailModalProps) => (
  <Modal
    isOpen={Boolean(detail)}
    onClose={onClose}
    heading={detail ? `${detail.label} address` : ''}
    description="Where the rider is sent, and the closest landmark we could match."
  >
    {detail ? (
      <div className="flex flex-col gap-5">
        <LocationMiniMap location={detail.location} label={detail.label} />

        <section className="flex flex-col gap-2">
          <h3 className="type-eyebrow">Closest landmark</h3>
          <NearestPlace location={detail.location} />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="type-eyebrow">Administrative area</h3>
          <ul className='w-full grid grid-cols-2 gap-2'>
          <AdministrativeLocation location={detail.location} />
          </ul>
        </section>
      </div>
    ) : null}
  </Modal>
);

export default LocationDetailModal;
