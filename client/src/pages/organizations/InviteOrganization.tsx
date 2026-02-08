import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { useInviteOrganizationMutation } from '@/api/mutations/organization.mutations';
import type { InviteOrganizationPayload } from '@/types/organization.type';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const InviteOrganization = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [inviteOrganization, { isLoading }] = useInviteOrganizationMutation();
  useDocumentTitle('Invite Organization');

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
        `Invite sent! An onboarding email was sent to ${data.adminEmail}.`
      );
      toast.success('Invite sent. Onboarding email delivered.');
      reset();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Unable to send invite. Please try again.';
      setStatusMessage(message);
      toast.error(message);
    }
  });

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-primary-900">
          Invite an organization
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Send an onboarding invite to a new organization and their admin contact.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Organization details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Organization name is required.' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Organization name"
                    placeholder="Acme Logistics"
                    required
                    errorMessage={errors?.name?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Organization email is required.',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Enter a valid email address.',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Organization email"
                    placeholder="ops@acme.com"
                    type="email"
                    required
                    errorMessage={errors?.email?.message}
                  />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: 'Organization phone number is required.' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Phone number"
                    placeholder="+1 (555) 555-1234"
                    required
                    errorMessage={errors?.phoneNumber?.message}
                  />
                )}
              />
              <Controller
                name="address"
                control={control}
                rules={{ required: 'Address is required.' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Address"
                    placeholder="123 Market St, San Francisco, CA"
                    required
                    errorMessage={errors?.address?.message}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Admin contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="adminName"
                control={control}
                rules={{ required: 'Admin name is required.' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Admin name"
                    placeholder="Jordan Smith"
                    required
                    errorMessage={errors?.adminName?.message}
                  />
                )}
              />
              <Controller
                name="adminEmail"
                control={control}
                rules={{
                  required: 'Admin email is required.',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Enter a valid email address.',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Admin email"
                    placeholder="jordan@acme.com"
                    type="email"
                    required
                    errorMessage={errors?.adminEmail?.message}
                  />
                )}
              />
            </div>
          </div>

          {statusMessage && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {statusMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              primary
              className="px-6"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Send invite
            </Button>
            <Button route="/users" className="px-6">
              Back to users
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default InviteOrganization;
