import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { toast } from 'sonner';
import { useChangePasswordMutation } from '@/api/mutations/auth.mutations';
import { validatePasswordStrength } from '@/utils/password.util.ts';

interface UpdateUserProfileFormData {
  name: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  dateOfBirth: string;
}

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

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

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    setError: setPasswordError,
    watch: watchPassword,
    formState: { errors: passwordErrors, isDirty: isPasswordDirty },
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const watchedNewPassword = watchPassword('newPassword');
  const passwordHelpText = useMemo(() => {
    if (!watchedNewPassword) return 'Minimum 8 characters, with mixed case, a number, and a symbol.';
    const message = validatePasswordStrength(watchedNewPassword);
    return message ? message : 'Looks good.';
  }, [watchedNewPassword]);

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
    setIsChangePasswordOpen(false);
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

  const closeChangePasswordModal = useCallback(() => {
    setIsChangePasswordOpen(false);
    resetPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [resetPasswordForm]);

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

  const onSubmitPassword = handlePasswordSubmit(async (formData) => {
    const oldPassword = formData.oldPassword ?? '';
    const newPassword = formData.newPassword ?? '';
    const confirmPassword = formData.confirmPassword ?? '';

    if (!oldPassword) {
      setPasswordError('oldPassword', { type: 'required', message: 'Old password is required' });
      return;
    }

    const strengthMessage = validatePasswordStrength(newPassword);
    if (strengthMessage) {
      setPasswordError('newPassword', { type: 'validate', message: strengthMessage });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('confirmPassword', { type: 'validate', message: 'Passwords do not match' });
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const response = await changePassword({ oldPassword, newPassword }).unwrap();
      toast.success(response?.message || 'Password updated successfully.');
      closeChangePasswordModal();
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Failed to update password'
      );
    }
  });

  return (
    <>
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

          <footer className="flex flex-wrap justify-between gap-3 pt-4 border-t border-slate-200">

          <Button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className=" paddind-top-10px bg-white text-primary-900"
            >
              Change Password
            </Button>
            
          <span className="flex flex-wrap justify-end gap-3">
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
            </span>
          </footer>
        </form>
      </Modal>

      <Modal
        isOpen={isChangePasswordOpen}
        onClose={closeChangePasswordModal}
        heading="Change Password"
        description="Enter your current password and choose a new one."
        className="min-w-[min(95vw,560px)]"
      >
        <form onSubmit={onSubmitPassword} className="w-full flex flex-col gap-4">
          <fieldset className="grid grid-cols-1 gap-4">
            <Controller
              name="oldPassword"
              control={passwordControl}
              rules={{ required: 'Old password is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  label="Old password"
                  placeholder="Enter your current password"
                  className={passwordErrors.oldPassword ? 'border-destructive' : ''}
                  errorMessage={passwordErrors.oldPassword?.message}
                />
              )}
            />

            <Controller
              name="newPassword"
              control={passwordControl}
              rules={{
                validate: (value) => validatePasswordStrength(value) || true,
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  label="New password"
                  placeholder="Minimum 8 characters"
                  className={passwordErrors.newPassword ? 'border-destructive' : ''}
                  errorMessage={passwordErrors.newPassword?.message}
                />
              )}
            />

            <p className="text-xs text-slate-500 -mt-2">{passwordHelpText}</p>

            <Controller
              name="confirmPassword"
              control={passwordControl}
              rules={{
                validate: (value, formValues) =>
                  value === formValues.newPassword || 'Passwords do not match',
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  label="Retype new password"
                  placeholder="Re-enter your new password"
                  className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
                  errorMessage={passwordErrors.confirmPassword?.message}
                />
              )}
            />
          </fieldset>

          <footer className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              onClick={closeChangePasswordModal}
              className="bg-gray-100 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              primary
              isLoading={isChangingPassword}
              disabled={!isPasswordDirty && !isChangingPassword}
            >
              Update Password
            </Button>
          </footer>
        </form>
      </Modal>
    </>
  );
};

export default UpdateUserProfileModal;
