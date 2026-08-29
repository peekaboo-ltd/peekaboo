import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setUpdateOrderLocationToModal } from '@/states/slices/order.slice';
import { useUpdateOrder, useUpdatePublicOrder } from '@/hooks/orders/orders.hooks';
import Modal from '../Modal';
import PlaceSearch, { type PlaceSearchResult } from '../inputs/PlaceSearch';
import Button from '../inputs/Button';
import { placeSearchResultToOrderLocation } from '@/utils/locations.util';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/i18n';

const UpdateOrderLocationTo = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { updateOrderLocationToModal, order } = useAppSelector((state) => state.order);
  const { token } = useAppSelector((state) => state.auth);
  const { updateOrder, isLoading: authLoading, isSuccess: authSuccess } = useUpdateOrder();
  const { updatePublicOrder, isLoading: publicLoading, isSuccess: publicSuccess } = useUpdatePublicOrder();
  const isLoading = token ? authLoading : publicLoading;
  const isSuccess = token ? authSuccess : publicSuccess;
  const [selectedLocation, setSelectedLocation] = useState<PlaceSearchResult | null>(null);

  const handleLocationSelect = (location: PlaceSearchResult) => {
    setSelectedLocation(location);
  };

  const handleSaveLocation = () => {
    if (selectedLocation && order?.id) {
      const payload = {
        id: order.id,
        order: {
          locationTo: placeSearchResultToOrderLocation(selectedLocation),
        },
      };
      if (token) {
        updateOrder(payload);
      } else {
        updatePublicOrder(payload);
      }
    }
  };

  const handleClose = useCallback(() => {
    setSelectedLocation(null);
    dispatch(setUpdateOrderLocationToModal(false));
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(t('location.dropoff.updated'));
      handleClose();
    }
  }, [isSuccess, handleClose, t]);

  return (
    <Modal
      isOpen={updateOrderLocationToModal}
      onClose={handleClose}
      className="top-[42%] translate-y-[-42%] sm:top-[50%] sm:translate-y-[-50%]"
      heading={t('location.dropoff.updateTitle')}
      description={t('location.dropoff.updateDescription')}
    >
      <article className="flex flex-col gap-6">

          <PlaceSearch
            onLocationSelect={handleLocationSelect}
            placeholder={t('location.dropoff.searchPlaceholder')}
            className="relative"
            country="rw"
          />
        {selectedLocation && (
          <aside className="p-4 bg-(--surface) rounded-lg border">
            <h5 className="text-sm font-normal text-(--ink) mb-2">{t('location.selectedDestination')}:</h5>
            <address className="text-sm text-(--ink) not-italic">
              <strong>{selectedLocation.name}</strong>
              <br />
              {selectedLocation.formattedAddress}
            </address>
          </aside>
        )}

          <Button
            onClick={handleSaveLocation}
            disabled={!selectedLocation || isLoading}
            isLoading={isLoading}
            primary
            className="px-6 py-2 self-end"
          >
            {t('location.saveDestination')}
          </Button>
      </article>
    </Modal>
  );
};

export default UpdateOrderLocationTo;
