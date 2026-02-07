import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setUpdateOrderLocationFromModal } from '@/states/slices/order.slice';
import { useUpdateOrder } from '@/hooks/orders/orders.hooks';
import Modal from '../Modal';
import PlaceSearch, { type PlaceSearchResult } from '../inputs/PlaceSearch';
import Button from '../inputs/Button';
import { toast } from 'sonner';

const UpdateOrderLocationFrom = () => {
  const dispatch = useAppDispatch();
  const { updateOrderLocationFromModal, order } = useAppSelector((state) => state.order);
  const { updateOrder, isLoading, isSuccess } = useUpdateOrder();
  const [selectedLocation, setSelectedLocation] = useState<PlaceSearchResult | null>(null);

  const handleLocationSelect = (location: PlaceSearchResult) => {
    setSelectedLocation(location);
  };

  const handleSaveLocation = () => {
    if (selectedLocation && order?.id) {
      updateOrder({
        id: order.id,
        order: {
          locationFrom: {
            latitude: selectedLocation.coordinates.latitude,
            longitude: selectedLocation.coordinates.longitude,
          },
        },
      });
    }
  };

  const handleClose = useCallback(() => {
    setSelectedLocation(null);
    dispatch(setUpdateOrderLocationFromModal(false));
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Origin location updated successfully');
      handleClose();
    }
  }, [isSuccess, handleClose]);

  return (
    <Modal
      isOpen={updateOrderLocationFromModal}
      onClose={handleClose}
      heading="Update Origin Location"
      description="Search and select the pickup location for your order"
    >
      <article className="space-y-6">
        <section className="space-y-4">
          <header>
            <h4 className="text-lg font-medium text-gray-900">Search Location</h4>
            <p className="text-sm text-gray-600">
              Enter the address or location name where the package should be picked up
            </p>
          </header>

          <PlaceSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Search for pickup location..."
            className="relative"
            country="rw"
          />
        </section>

        {selectedLocation && (
          <aside className="p-4 bg-gray-50 rounded-lg border">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Selected Location:</h5>
            <address className="text-sm text-gray-700 not-italic">
              <strong>{selectedLocation.name}</strong>
              <br />
              {selectedLocation.formattedAddress}
            </address>
          </aside>
        )}

        <footer className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleSaveLocation}
            disabled={!selectedLocation || isLoading}
            isLoading={isLoading}
            primary
            className="px-6 py-2"
          >
            Save Location
          </Button>
        </footer>
      </article>
    </Modal>
  );
};

export default UpdateOrderLocationFrom;
