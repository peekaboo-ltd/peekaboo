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

const SetUserDefaultLocationModal = () => {
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
      toast.success('Default location updated successfully');
      handleClose();
    }
  }, [isSuccess, data, dispatch, handleClose]);

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
      heading="Default Pickup Location"
      description="Set the location that will be pre-filled when you create orders"
    >
      <article className="space-y-6">
        <section className="space-y-4">
          <header>
            <h4 className="type-card-title">Search Location</h4>
            <p className="text-sm text-(--muted)">
              Enter an address or place name to use as your default pickup point
            </p>
          </header>

          <PlaceSearch
            onLocationSelect={setSelectedLocation}
            placeholder="Search for your default location..."
            className="relative"
            country="rw"
          />
        </section>

        {selectedLocation && (
          <aside className="p-4 bg-(--surface) rounded-lg border">
            <h5 className="text-sm font-normal text-(--ink) mb-2">
              Selected Location:
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
            Cancel
          </Button>
          <Button
            onClick={handleSave}
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

export default SetUserDefaultLocationModal;
