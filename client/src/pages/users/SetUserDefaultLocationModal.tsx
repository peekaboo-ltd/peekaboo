import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setSelectedUser,
  setUserDefaultLocationModal,
} from '@/states/slices/user.slice';
import { useUpdateUser } from '@/hooks/users/users.hooks';
import Modal from '@/components/Modal';
import PlaceSearch, { type PlaceSearchResult } from '@/components/inputs/PlaceSearch';
import Button from '@/components/inputs/Button';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/i18n';

const SetUserDefaultLocationModal = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { userDefaultLocationModal, selectedUser } = useAppSelector(
    (state) => state.user
  );
  const { updateUser, isLoading, isSuccess, data } = useUpdateUser();
  const [selectedLocation, setSelectedLocation] =
    useState<PlaceSearchResult | null>(null);

  const handleClose = useCallback(() => {
    setSelectedLocation(null);
    dispatch(setUserDefaultLocationModal(false));
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && data?.data) {
      dispatch(setSelectedUser(data.data));
      toast.success(t('profile.defaultLocationUpdated'));
      handleClose();
    }
  }, [isSuccess, data, dispatch, handleClose, t]);

  const handleSave = () => {
    if (selectedLocation?.coordinates && selectedUser?.id) {
      updateUser({
        id: selectedUser.id,
        defaultLocation: {
          latitude: selectedLocation?.coordinates?.latitude,
          longitude: selectedLocation?.coordinates?.longitude,
        },
      });
    }
  };

  return (
    <Modal
      isOpen={userDefaultLocationModal}
      onClose={handleClose}
      className="top-[42%] translate-y-[-42%] sm:top-[50%] sm:translate-y-[-50%]"
      heading={t('profile.defaultLocationTitle')}
      description={t('profile.defaultLocationDescription')}
    >
      <article className="space-y-6">
        <section className="space-y-4">
          <header>
            <h4 className="type-card-title">{t('location.searchTitle')}</h4>
            <p className="text-sm text-(--muted)">
              {t('profile.defaultLocationDescription')}
            </p>
          </header>

          <PlaceSearch
            onLocationSelect={setSelectedLocation}
            placeholder={t('profile.defaultLocationPlaceholder')}
            className="relative"
            country="rw"
          />
        </section>

        {selectedLocation && (
          <aside className="p-4 bg-(--surface) rounded-lg border">
            <h5 className="text-sm font-normal text-(--ink) mb-2">
              {t('location.selected')}:
            </h5>
            <address className="text-sm text-(--ink) not-italic">
              <strong>{selectedLocation.name}</strong>
              <br />
              {selectedLocation.formattedAddress}
            </address>
          </aside>
        )}

        <footer className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button onClick={handleClose} className="px-6 py-2">
            {t('users.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedLocation || isLoading}
            isLoading={isLoading}
            primary
            className="px-6 py-2"
          >
            {t('location.save')}
          </Button>
        </footer>
      </article>
    </Modal>
  );
};

export default SetUserDefaultLocationModal;
