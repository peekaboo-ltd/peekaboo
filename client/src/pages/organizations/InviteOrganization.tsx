import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import Button from '@/components/inputs/Button';
import { useInviteOrganizationMutation } from '@/api/mutations/organization.mutations';
import type { InviteOrganizationPayload } from '@/types/organization.type';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useNavigate } from 'react-router-dom';
import { validateRwandanPhoneNumber } from '@/utils/phone.util';
import { useI18n } from '@/i18n/i18n';

const InviteOrganization = () => {
  const { t } = useI18n();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [inviteOrganization, { isLoading }] = useInviteOrganizationMutation();
  useDocumentTitle(t('organization.inviteDocTitle'));

  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteOrganizationPayload>({
    defaultValues: {
      name: '',
      email: '',
      adminName: '',
      adminEmail: '',
      phoneNumber: '',
      address: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await inviteOrganization(data).unwrap();
      setStatusMessage(
        t('organization.inviteSentTo', { email: data.adminEmail })
      );
      toast.success(t('organization.inviteSent'));
      navigate(-1);
      reset();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('organization.inviteError');
      setStatusMessage(message);
      toast.error(message);
    }
  });

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="type-page-title">
          {t('organization.inviteTitle')}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {t('organization.inviteDescription')}
        </p>
      </header>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <h2 className="type-label mb-3">
              {t('organization.details')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.name')}
                    placeholder={t('organization.namePlaceholder')}
                    required
                    errorMessage={errors?.name?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                rules={{
                  required: t('validation.required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('validation.invalidEmail'),
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.email')}
                    placeholder={t('organization.emailPlaceholder')}
                    type="email"
                    required
                    errorMessage={errors?.email?.message}
                  />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: t('validation.required'),
                  validate: (value) => validateRwandanPhoneNumber(value),
                }}
                render={({ field }) => (
                  <TelInput
                    {...field}
                    label={t('organization.phone')}
                    placeholder={t('organization.phonePlaceholder')}
                    required
                    errorMessage={errors?.phoneNumber?.message}
                  />
                )}
              />
              <Controller
                name="address"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.address')}
                    placeholder={t('organization.addressPlaceholder')}
                    required
                    errorMessage={errors?.address?.message}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <h2 className="type-label mb-3">
              {t('organization.adminContact')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="adminName"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.adminName')}
                    placeholder={t('organization.adminNamePlaceholder')}
                    required
                    errorMessage={errors?.adminName?.message}
                  />
                )}
              />
              <Controller
                name="adminEmail"
                control={control}
                rules={{
                  required: t('validation.required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('validation.invalidEmail'),
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.adminEmail')}
                    placeholder={t('organization.adminEmailPlaceholder')}
                    type="email"
                    required
                    errorMessage={errors?.adminEmail?.message}
                  />
                )}
              />
            </div>
          </div>

          {statusMessage && (
            <p className="rounded-lg bg-(--surface) px-4 py-3 text-sm text-(--ink)">
              {statusMessage}
            </p>
          )}

          <footer className="flex items-center justify-between gap-3">
            <Button onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}>
              {t('organization.back')}
            </Button>
            <Button
              type="submit"
              primary
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('organization.sendInvite')}
            </Button>
          </footer>
        </form>
      </section>
    </main>
  );
};

export default InviteOrganization;
