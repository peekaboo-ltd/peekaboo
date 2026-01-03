import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Loader } from '../inputs/Loader';
import { RoleTypes } from '../../types/auth.type';
import { UserStatus } from '../../constants/user.constants';
import type { User } from '../../types/user.type';

export interface UserFormData {
  name?: string;
  email?: string;
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
  roles: RoleTypes[];
  status: UserStatus;
  nationality?: string;
  dateOfBirth?: string;
}

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const form = useForm<UserFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      password: '',
      confirmPassword: '',
      roles: user?.userRoles?.map(ur => ur.role.name) || [RoleTypes.CUSTOMER],
      status: user?.status || UserStatus.ACTIVE,
      nationality: user?.nationality || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    },
  });

  const selectedRoles = form.watch('roles');

  const handleSubmit = async (data: UserFormData) => {
    if (!isEdit && data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }

    await onSubmit(data);
  };

  const handleRoleToggle = (role: RoleTypes, checked: boolean) => {
    const currentRoles = form.getValues('roles') || [];
    
    if (checked) {
      form.setValue('roles', [...currentRoles, role]);
    } else {
      form.setValue('roles', currentRoles.filter(r => r !== role));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            rules={{
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            rules={{
              required: 'Phone number is required',
              pattern: {
                value: /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                message: 'Invalid phone number',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                    <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEdit && (
            <>
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: !isEdit ? 'Password is required' : undefined,
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password {!isEdit && '*'}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: !isEdit ? 'Please confirm password' : undefined,
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password {!isEdit && '*'}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., United States" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <fieldset className="space-y-4">
          <legend>
            <Label>Roles *</Label>
            <FormDescription>
              Select one or more roles for this user
            </FormDescription>
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.values(RoleTypes).map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={(checked) =>
                    handleRoleToggle(role, checked as boolean)
                  }
                />
                <Label
                  htmlFor={role}
                  className="text-sm font-normal cursor-pointer"
                >
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </Label>
              </div>
            ))}
          </div>
          {form.formState.errors.roles && (
            <p className="text-sm text-destructive">
              Please select at least one role
            </p>
          )}
        </fieldset>

        <footer className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEdit ? 'Update User' : 'Create User'}</>
            )}
          </Button>
        </footer>
      </form>
    </Form>
  );
};