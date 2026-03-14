import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useCreateBusinessPlanMutation } from '@/api/mutations/businessPlan.mutations';
import type { CreateBusinessPlanPayload } from '@/types/businessPlan.type';
import { BusinessPlanStatus } from '@/types/businessPlan.type';
import {
  InternalPage,
  InternalPageHeader,
} from '@/components/layout/InternalPage';

const CreateBusinessPlanPage = () => {
  useDocumentTitle('Create Business Plan');
  const navigate = useNavigate();

  const [createBusinessPlan, { isLoading }] = useCreateBusinessPlanMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBusinessPlanPayload>({
    defaultValues: {
      name: '',
      description: '',
      pricePerOrder: 0,
      currency: 'RWF',
      status: BusinessPlanStatus.ACTIVE,
      isDefault: false,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createBusinessPlan(data).unwrap();
      toast.success('Business plan created successfully.');
      navigate('/business-plans');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to create business plan.';
      toast.error(message);
    }
  });

  return (
    <InternalPage>
      <InternalPageHeader
        eyebrow="Business Plans"
        title="Create Business Plan"
        description="Define a new pricing plan to assign to organizations."
      />

      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Plan name is required.' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Plan Name"
                  placeholder="Standard Plan"
                  required
                  errorMessage={errors.name?.message}
                />
              )}
            />
            <Controller
              name="currency"
              control={control}
              rules={{ required: 'Currency is required.' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Currency"
                  placeholder="RWF"
                  required
                  errorMessage={errors.currency?.message}
                />
              )}
            />
            <Controller
              name="pricePerOrder"
              control={control}
              rules={{
                required: 'Price per order is required.',
                min: { value: 0, message: 'Price must be 0 or greater.' },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Price Per Order"
                  placeholder="500"
                  type="number"
                  required
                  errorMessage={errors.pricePerOrder?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { label: 'Active', value: BusinessPlanStatus.ACTIVE },
                    { label: 'Inactive', value: BusinessPlanStatus.INACTIVE },
                  ]}
                  placeholder="Select status"
                />
              )}
            />
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Brief description of this plan..."
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          />

          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-slate-700">
                  Set as default plan
                  <span className="ml-1 text-xs text-slate-400">
                    (assigned to organizations with no plan)
                  </span>
                </span>
              </label>
            )}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" primary isLoading={isLoading} disabled={isLoading}>
              Create Plan
            </Button>
            <Button
              type="button"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
        </form>
      </section>
    </InternalPage>
  );
};

export default CreateBusinessPlanPage;
