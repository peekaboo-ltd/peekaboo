import { useCallback, useState } from 'react';
import Modal from '@/components/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setCreateUserModal } from '@/states/slices/user.slice';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useCreateUser } from '@/hooks/users/users.hooks';
import { RoleTypes } from '@/types/auth.type';
import { Controller, useForm } from 'react-hook-form';

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
  const [selectedRoles, setSelectedRoles] = useState<RoleTypes[]>([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateUserFormData>({
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
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const onSubmit = handleSubmit((data) => {
    createUser({
      name: data.name,
      email: data.email || undefined,
      phoneNumber: data.phoneNumber,
      passwordHash: data.password || undefined,
      roles: selectedRoles.length > 0 ? selectedRoles : [RoleTypes.CUSTOMER],
    });
  });

  const availableRoles = Object.values(RoleTypes);

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
                <span className="text-sm font-medium text-gray-700">Name *</span>
                <Input
                  {...field}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <span className="text-xs text-destructive">{errors.name.message}</span>
                )}
              </label>
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Phone Number *</span>
                <Input
                  {...field}
                  placeholder="Enter phone number (e.g., 0788123456)"
                  className={errors.phoneNumber ? 'border-destructive' : ''}
                />
                {errors.phoneNumber && (
                  <span className="text-xs text-destructive">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </label>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter email address"
                />
              </label>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Password</span>
                <Input
                  {...field}
                  type="password"
                  placeholder="Enter password (optional)"
                />
                <span className="text-xs text-gray-500">
                  Leave empty to generate a random password
                </span>
              </label>
            )}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-gray-700 mb-2">
            Assign Roles
          </legend>
          <menu className="flex flex-wrap gap-2">
            {availableRoles.map((role) => (
              <li key={role}>
                <button
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                    selectedRoles.includes(role)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              </li>
            ))}
          </menu>
          {selectedRoles.length === 0 && (
            <p className="text-xs text-gray-500">
              No roles selected. Customer role will be assigned by default.
            </p>
          )}
        </fieldset>

        <footer className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" onClick={closeModal} className="bg-gray-100 text-gray-700">
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
