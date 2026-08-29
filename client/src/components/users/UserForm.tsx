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
import TelInput from '../inputs/TelInput';
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
import { validateRwandanPhoneNumber } from '../../utils/phone.util';
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();
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
        message: t('validation.passwordMismatch'),
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
                message: t('userForm.nameMin'),
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('userForm.fullName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('userForm.namePlaceholder')} {...field} />
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
                message: t('validation.invalidEmail'),
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('userForm.email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('userForm.emailPlaceholder')}
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
              required: t('common.phoneRequired'),
              validate: (value) => validateRwandanPhoneNumber(value),
            }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TelInput
                    {...field}
                    label={t('userForm.phone')}
                    required
                    placeholder={t('userForm.phonePlaceholder')}
                    errorMessage={form.formState.errors.phoneNumber?.message}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.status')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('userForm.selectStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserStatus.ACTIVE}>{t('status.active')}</SelectItem>
                    <SelectItem value={UserStatus.INACTIVE}>{t('status.inactive')}</SelectItem>
                    <SelectItem value={UserStatus.SUSPENDED}>{t('status.suspended')}</SelectItem>
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
                  required: !isEdit ? t('auth.passwordRequired') : undefined,
                  minLength: {
                    value: 8,
                    message: t('validation.passwordMinLength'),
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userForm.password')} {!isEdit && '*'}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('userForm.passwordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('userForm.passwordHint')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: !isEdit ? t('userForm.confirmPasswordRequired') : undefined,
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userForm.confirmPassword')} {!isEdit && '*'}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('userForm.confirmPassword')}
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
                <FormLabel>{t('userForm.nationality')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('userForm.nationalityPlaceholder')} {...field} />
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
                <FormLabel>{t('userForm.dateOfBirth')}</FormLabel>
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
            <Label>{t('userForm.roles')}</Label>
            <FormDescription>
              {t('userForm.rolesHint')}
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
                  {t(`role.${role.toLowerCase()}`)}
                </Label>
              </div>
            ))}
          </div>
          {form.formState.errors.roles && (
            <p className="text-sm text-destructive">
              {t('userForm.roleRequired')}
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
            {t('common.actions.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4" />
                {isEdit ? t('userForm.updating') : t('userForm.creating')}
              </>
            ) : (
              <>{isEdit ? t('userForm.update') : t('userForm.create')}</>
            )}
          </Button>
        </footer>
      </form>
    </Form>
  );
};
