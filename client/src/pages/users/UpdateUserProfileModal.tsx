import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Modal from '@/components/Modal';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import Button from '@/components/inputs/Button';
import { useUpdateUserMutation } from '@/api/mutations/users.mutations';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setSelectedUser,
  setUpdateUserModal,
} from '@/states/slices/user.slice';
import { setUser as setAuthUser } from '@/states/slices/auth.slice';
import Select from '@/components/inputs/Select';
import { COUNTRIES_LIST } from '@/constants/countries.constants';
import { capitalizeString } from '@/utils/strings.util';
import { toast } from 'sonner';
import { useChangePasswordMutation } from '@/api/mutations/auth.mutations';
import { validatePasswordStrength } from '@/utils/password.util.ts';
import {
  useUploadUserAvatarMutation,
  useRemoveUserAvatarMutation,
} from '@/api/mutations/users.mutations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfilePhotoUrl } from '@/utils/profilePhoto.util';
import { localStorageUtil } from '@/utils/localStorage.util';
import { validateRwandanPhoneNumber } from '@/utils/phone.util';

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

const ASPECT = 1;

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      ASPECT,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function getCroppedImage(
  image: HTMLImageElement,
  crop: Crop
): Promise<File> {
  const canvas = document.createElement('canvas');
  const isPercent = crop.unit === '%';
  const scaleX = isPercent ? image.naturalWidth / 100 : image.naturalWidth / image.width;
  const scaleY = isPercent ? image.naturalHeight / 100 : image.naturalHeight / image.height;
  const pixelCrop = {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: crop.width * scaleX,
    height: crop.height * scaleY,
  };
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('No canvas context'));
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to blob failed'));
          return;
        }
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        resolve(file);
      },
      'image/jpeg',
      0.92
    );
  });
}

const UpdateUserProfileModal = () => {
  const dispatch = useAppDispatch();
  const { updateUserModal, selectedUser } = useAppSelector(
    (state) => state.user,
  );
  const { user: authUser } = useAppSelector((state) => state.auth);
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadUserAvatarMutation();
  const [removeAvatar, { isLoading: isRemovingAvatar }] = useRemoveUserAvatarMutation();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [removePhotoRequested, setRemovePhotoRequested] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrcForCrop, setImageSrcForCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pendingPhotoPreviewUrl = useMemo(() => {
    if (!pendingPhotoFile) return null;
    return URL.createObjectURL(pendingPhotoFile);
  }, [pendingPhotoFile]);
  useEffect(() => {
    return () => {
      if (pendingPhotoPreviewUrl) URL.revokeObjectURL(pendingPhotoPreviewUrl);
    };
  }, [pendingPhotoPreviewUrl]);

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

  const closeModal = useCallback(() => {
    dispatch(setUpdateUserModal(false));
    setIsChangePasswordOpen(false);
    setPendingPhotoFile(null);
    setRemovePhotoRequested(false);
    setRemoveConfirmOpen(false);
    setCropModalOpen(false);
    if (imageSrcForCrop) URL.revokeObjectURL(imageSrcForCrop);
    setImageSrcForCrop(null);
    if (selectedUser) {
      reset({
        name: selectedUser.name ?? '',
        email: selectedUser.email ?? '',
        phoneNumber: selectedUser.phoneNumber ?? '',
        nationality: selectedUser.nationality ?? '',
        dateOfBirth: formatDateInput(selectedUser.dateOfBirth),
      });
    }
  }, [dispatch, reset, selectedUser, imageSrcForCrop]);

  const closeChangePasswordModal = useCallback(() => {
    setIsChangePasswordOpen(false);
    resetPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [resetPasswordForm]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG or WebP).');
      return;
    }
    setRemovePhotoRequested(false);
    if (imageSrcForCrop) URL.revokeObjectURL(imageSrcForCrop);
    setImageSrcForCrop(URL.createObjectURL(file));
    setCropModalOpen(true);
    e.target.value = '';
  }, [imageSrcForCrop]);

  const onCropImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const applyCrop = useCallback(async () => {
    if (!imgRef.current || !crop?.width || !crop?.height) return;
    try {
      const file = await getCroppedImage(imgRef.current, crop);
      setPendingPhotoFile(file);
      setRemovePhotoRequested(false);
    } catch {
      toast.error('Failed to crop image.');
    } finally {
      if (imageSrcForCrop) URL.revokeObjectURL(imageSrcForCrop);
      setImageSrcForCrop(null);
      setCropModalOpen(false);
    }
  }, [crop, imageSrcForCrop]);

  const openRemoveConfirm = useCallback(() => {
    setRemoveConfirmOpen(true);
  }, []);

  const removePhoto = useCallback(() => {
    setPendingPhotoFile(null);
    setRemovePhotoRequested(true);
    if (imageSrcForCrop) URL.revokeObjectURL(imageSrcForCrop);
    setImageSrcForCrop(null);
    setCropModalOpen(false);
    setRemoveConfirmOpen(false);
  }, [imageSrcForCrop]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!selectedUser?.id) return;
    let updatedUser = selectedUser;

    try {
      if (removePhotoRequested) {
        const res = await removeAvatar(selectedUser.id).unwrap();
        if (res?.data) updatedUser = res.data;
        toast.success('Profile photo has been deleted.');
      }
      if (pendingPhotoFile) {
        const res = await uploadAvatar({ userId: selectedUser.id, file: pendingPhotoFile }).unwrap();
        if (res?.data) updatedUser = res.data;
      }

      await updateUser({
        id: selectedUser.id,
        name: formData.name?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        nationality: formData.nationality?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      }).unwrap();
      

      dispatch(setSelectedUser(updatedUser));
      if (authUser?.id === updatedUser.id) {
        dispatch(setAuthUser(updatedUser));
        localStorageUtil.setItem('user', updatedUser);
      }
      dispatch(setUpdateUserModal(false));
      setPendingPhotoFile(null);
      setRemovePhotoRequested(false);
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to save changes.';
      toast.error(msg);
    }
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
          <section className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-[--ink]">Profile photo</span>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 rounded-full border-2 border-[--line]">
                {pendingPhotoPreviewUrl ? (
                  <AvatarImage src={pendingPhotoPreviewUrl} alt="New profile" />
                ) : !removePhotoRequested && selectedUser?.profilePhotoUrl ? (
                  <AvatarImage
                    src={getProfilePhotoUrl(selectedUser.profilePhotoUrl) ?? undefined}
                    alt="Profile"
                  />
                ) : null}
                <AvatarFallback className="rounded-full bg-[--ink] text-lg text-[--ink]">
                  {selectedUser?.name?.[0]?.toUpperCase() ||
                    selectedUser?.email?.[0]?.toUpperCase() ||
                    selectedUser?.phoneNumber?.[0]?.toUpperCase() ||
                    '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                  aria-label="Choose profile photo"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[--surface] text-[--ink]"
                >
                  Change photo
                </Button>
                <Button
                  type="button"
                  onClick={openRemoveConfirm}
                  className="bg-[--surface] text-[--ink]"
                  disabled={!selectedUser?.profilePhotoUrl && !pendingPhotoFile}
                >
                  Remove photo
                </Button>
              </div>
            </div>
          </section>

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
              rules={{
                required: 'Phone number is required',
                validate: (value) => validateRwandanPhoneNumber(value),
              }}
              render={({ field }) => (
                <TelInput
                  {...field}
                  label="Phone Number"
                  placeholder="Enter your phone"
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

          <footer className="flex flex-wrap justify-between gap-3 pt-4 border-t border-[--line]">

          <Button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className=" paddind-top-10px bg-[--paper] text-[--ink]"
            >
              Change Password
            </Button>
            
          <span className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                onClick={closeModal}
                className="bg-[--surface] text-[--ink]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                primary
                isLoading={isLoading || isUploadingAvatar || isRemovingAvatar}
                disabled={(!isDirty && !pendingPhotoFile && !removePhotoRequested) || isLoading || isUploadingAvatar || isRemovingAvatar}
              >
                Save Changes
              </Button>
            </span>
          </footer>
        </form>
      </Modal>

      <Modal
        isOpen={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        heading="Remove profile photo?"
        description="Are you sure you want to remove your profile photo? This will take effect when you save your changes."
        className="z-[10001] min-w-[min(95vw,400px)]"
        overlayClassName="z-[10000]"
      >
        <footer className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            onClick={() => setRemoveConfirmOpen(false)}
            className="bg-[--surface] text-[--ink]"
          >
            Cancel
          </Button>
          <Button type="button" primary onClick={removePhoto}>
            Remove photo
          </Button>
        </footer>
      </Modal>

      <Modal
        isOpen={cropModalOpen}
        onClose={() => {
          if (imageSrcForCrop) URL.revokeObjectURL(imageSrcForCrop);
          setImageSrcForCrop(null);
          setCropModalOpen(false);
        }}
        heading="Crop photo"
        description="Adjust the crop area. The image will be saved as a square."
        className="min-w-[min(95vw,420px)]"
      >
        <div className="flex flex-col gap-4">
          {imageSrcForCrop && (
            <div className="flex justify-center overflow-hidden rounded-lg bg-[--surface]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                aspect={ASPECT}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imageSrcForCrop}
                  alt="Crop"
                  onLoad={onCropImageLoad}
                  style={{ maxHeight: '70vh', width: 'auto' }}
                />
              </ReactCrop>
            </div>
          )}
          <footer className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                if (imageSrcForCrop) URL.revokeObjectURL(imageSrcForCrop);
                setImageSrcForCrop(null);
                setCropModalOpen(false);
              }}
              className="bg-[--surface] text-[--ink]"
            >
              Cancel
            </Button>
            <Button type="button" primary onClick={applyCrop}>
              Apply
            </Button>
          </footer>
        </div>
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

            <p className="text-xs text-[--muted] -mt-2">{passwordHelpText}</p>

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

          <footer className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[--line]">
            <Button
              type="button"
              onClick={closeChangePasswordModal}
              className="bg-[--surface] text-[--ink]"
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
