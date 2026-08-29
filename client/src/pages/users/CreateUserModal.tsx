import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setCreateUserModal } from '@/states/slices/user.slice';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import { useCreateUser } from '@/hooks/users/users.hooks';
import { RoleTypes } from '@/types/auth.type';
import { Controller, useForm } from 'react-hook-form';
import { validateRwandanPhoneNumber } from '@/utils/phone.util';
import { MembershipStatus } from '@/types/organization.type';

interface CreateUserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: RoleTypes[];
}

const CreateUserModal = () => {
  const dispatch = useAppDispatch();
  const { createUserModal } = useAppSelector((state) => state.user);
  const { user: authUser } = useAppSelector((state) => state.auth);
  const [selectedRoles, setSelectedRoles] = useState<RoleTypes[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleTypes[]>(
    Object.values(RoleTypes),
  );

  useEffect(() => {
    if (
      authUser?.userRoles?.some(
        (userRole) => userRole?.role?.name === RoleTypes.ADMIN,
      )
    ) {
      setAvailableRoles(Object.values(RoleTypes));
    }
    if (
      authUser?.userRoles?.some(
        (userRole) => userRole?.role?.name === RoleTypes.BUSINESS,
      )
    ) {
      setAvailableRoles([RoleTypes.STAFF]);
    }
  }, [authUser?.userRoles]);

  const activeOrganizationId = useMemo(
    () =>
      authUser?.organizationMembership?.find(
        (membership) => membership.status === MembershipStatus.ACTIVE,
      )?.organization?.id,
    [authUser?.organizationMembership],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      roles: [],
    },
  });

  const closeModal = useCallback(() => {
    dispatch(setCreateUserModal(false));
    reset();
    setSelectedRoles([]);
  }, [dispatch, reset]);

  const { createUser, isLoading } = useCreateUser();

  const handleRoleToggle = (role: RoleTypes) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const onSubmit = handleSubmit((data) => {
    createUser({
      name: data.name,
      email: data.email || undefined,
      phoneNumber: data.phoneNumber,
      passwordHash: data?.password || undefined,
      roles: selectedRoles.length > 0 ? selectedRoles : [RoleTypes.CUSTOMER],
      organizationId: activeOrganizationId,
    });
  });

  return (
    <Modal
      isOpen={createUserModal}
      onClose={closeModal}
      heading="Create User"
      description="Add a new user to the system"
    >
      <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
        <fieldset className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-normal text-(--ink)">
                  Name *
                </span>
                <Input
                  {...field}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <span className="text-xs text-destructive">
                    {errors.name.message}
                  </span>
                )}
              </label>
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
                required
                placeholder="0788 123 456"
                errorMessage={errors.phoneNumber?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-normal text-(--ink)">Email</span>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter email address"
                />
              </label>
            )}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-normal text-(--ink) mb-2">
            Assign Roles
          </legend>
          <menu className="flex flex-wrap gap-2">
            {availableRoles?.map((role) => (
              <li key={role}>
                <button
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1.5 rounded text-sm font-normal transition-colors cursor-pointer ${
                    selectedRoles.includes(role)
                      ? 'bg-(--ink) text-(--paper)'
                      : 'bg-(--surface) text-(--ink) hover:bg-(--surface)'
                  }`}
                >
                  {role}
                </button>
              </li>
            ))}
          </menu>
          {selectedRoles.length === 0 && (
            <p className="type-meta">
              No roles selected. Customer role will be assigned by default.
            </p>
          )}
        </fieldset>

        <footer className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={closeModal}
            className="bg-(--surface) text-(--ink)"
          >
            Cancel
          </Button>
          <Button type="submit" primary isLoading={isLoading}>
            Create User
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
