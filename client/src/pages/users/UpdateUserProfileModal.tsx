import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Modal from '@/components/Modal';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { useUpdateUser } from '@/hooks/users/users.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setSelectedUser,
  setUpdateUserModal,
} from '@/states/slices/user.slice';
import Select from '@/components/inputs/Select';
import { COUNTRIES_LIST } from '@/constants/countries.constants';
import { capitalizeString } from '@/utils/strings.util';

interface UpdateUserProfileFormData {
  name: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  dateOfBirth: string;
}

const formatDateInput = (value?: string | Date) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const UpdateUserProfileModal = () => {
  const dispatch = useAppDispatch();
  const { updateUserModal, selectedUser } = useAppSelector(
    (state) => state.user,
  );
  const { updateUser, isLoading, isSuccess, data } = useUpdateUser();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserProfileFormData>({
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      nationality: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (selectedUser) {
      reset({
        name: selectedUser.name ?? '',
        email: selectedUser.email ?? '',
        phoneNumber: selectedUser.phoneNumber ?? '',
        nationality: selectedUser.nationality ?? '',
        dateOfBirth: formatDateInput(selectedUser.dateOfBirth),
      });
    }
  }, [selectedUser, reset]);

  useEffect(() => {
    if (isSuccess && data?.data) {
      dispatch(setSelectedUser(data.data));
      dispatch(setUpdateUserModal(false));
    }
  }, [isSuccess, data, dispatch]);

  const closeModal = useCallback(() => {
    dispatch(setUpdateUserModal(false));
    if (selectedUser) {
      reset({
        name: selectedUser.name ?? '',
        email: selectedUser.email ?? '',
        phoneNumber: selectedUser.phoneNumber ?? '',
        nationality: selectedUser.nationality ?? '',
        dateOfBirth: formatDateInput(selectedUser.dateOfBirth),
      });
    }
  }, [dispatch, reset, selectedUser]);

  const onSubmit = handleSubmit((formData) => {
    if (!selectedUser?.id) return;
    updateUser({
      id: selectedUser.id,
      name: formData.name?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      phoneNumber: formData.phoneNumber?.trim() || undefined,
      nationality: formData.nationality?.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
    });
  });

  return (
    <Modal
      isOpen={updateUserModal}
      onClose={closeModal}
      heading="Update Profile"
      description="Edit your personal details and contact information"
      className="min-w-[min(95vw,720px)]"
    >
      <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Full Name"
                placeholder="Enter your name"
                className={errors.name ? 'border-destructive' : ''}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                label="Email Address"
                placeholder="you@email.com"
                className={errors.email ? 'border-destructive' : ''}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label="Phone Number"
                placeholder="Enter your phone"
                className={errors.phoneNumber ? 'border-destructive' : ''}
                errorMessage={errors.phoneNumber?.message}
              />
            )}
          />

          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={COUNTRIES_LIST?.map((country) => {
                  return {
                    value: country?.code,
                    label: capitalizeString(country?.name),
                  };
                })}
                label="Nationality"
                placeholder="Country"
                className={errors.nationality ? 'border-destructive' : ''}
              />
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                label="Date of Birth"
                className={errors.dateOfBirth ? 'border-destructive' : ''}
                errorMessage={errors.dateOfBirth?.message}
              />
            )}
          />
        </fieldset>

        <footer className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            onClick={closeModal}
            className="bg-gray-100 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            primary
            isLoading={isLoading}
            disabled={!isDirty && !isLoading}
          >
            Save Changes
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default UpdateUserProfileModal;
