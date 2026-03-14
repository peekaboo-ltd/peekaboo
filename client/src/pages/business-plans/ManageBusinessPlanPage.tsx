import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faBuilding,
  faShieldHalved,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchBusinessPlanByIdQuery, useFetchBusinessPlanOrganizationCountQuery } from '@/api/queries/businessPlan.queries';
import { useUpdateBusinessPlanMutation, useDeleteBusinessPlanMutation } from '@/api/mutations/businessPlan.mutations';
import { useFetchOrganizationsQuery } from '@/api/queries/organization.queries';
import type { UpdateBusinessPlanPayload } from '@/types/businessPlan.type';
import { BusinessPlanStatus } from '@/types/businessPlan.type';
import type { Organization } from '@/types/organization.type';
import {
  InternalPage,
  InternalPageHeader,
  InternalStatCard,
} from '@/components/layout/InternalPage';
import { UUID } from '@/types';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

type PlanFormValues = {
  name: string;
  description?: string;
  pricePerOrder: number;
  currency: string;
  status: BusinessPlanStatus;
  isDefault: boolean;
};

const ManageBusinessPlanPage = () => {
  const { id } = useParams<{ id: UUID }>();
  const navigate = useNavigate();
  useDocumentTitle('Manage Business Plan');

  const { data: planData, isFetching: isFetchingPlan } = useFetchBusinessPlanByIdQuery(id!, {
    skip: !id,
  });
  const { data: countData } = useFetchBusinessPlanOrganizationCountQuery(id!, {
    skip: !id,
  });
  const { data: orgsData, isFetching: isFetchingOrgs } = useFetchOrganizationsQuery(
    { page: 1, size: 200 },
    { skip: !id }
  );

  const [updateBusinessPlan, { isLoading: isUpdating }] = useUpdateBusinessPlanMutation();
  const [deleteBusinessPlan, { isLoading: isDeleting }] = useDeleteBusinessPlanMutation();

  const plan = planData?.data;
  const orgCount = countData?.data?.count ?? 0;

  // Filter orgs that use this plan client-side
  const orgsOnPlan: Organization[] = (orgsData?.data?.rows ?? []).filter(
    (org: Organization) => org.businessPlanId === id
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    defaultValues: {
      name: '',
      description: '',
      pricePerOrder: 0,
      currency: 'RWF',
      status: BusinessPlanStatus.ACTIVE,
      isDefault: false,
    },
  });

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name ?? '',
        description: plan.description ?? '',
        pricePerOrder: plan.pricePerOrder ?? 0,
        currency: plan.currency ?? 'RWF',
        status: plan.status ?? BusinessPlanStatus.ACTIVE,
        isDefault: plan.isDefault ?? false,
      });
    }
  }, [plan, reset]);

  const onSubmit = handleSubmit(async (data: UpdateBusinessPlanPayload) => {
    if (!id) return;
    try {
      await updateBusinessPlan({ id, data }).unwrap();
      toast.success('Business plan updated successfully.');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to update business plan.';
      toast.error(message);
    }
  });

  const handleDelete = async () => {
    if (!id) return;
    if (orgCount > 0) {
      toast.error('Cannot delete a plan with active organizations.');
      return;
    }
    if (!window.confirm(`Delete plan "${plan?.name}"? This cannot be undone.`)) return;
    try {
      await deleteBusinessPlan(id).unwrap();
      toast.success('Business plan deleted.');
      navigate('/business-plans');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to delete business plan.';
      toast.error(message);
    }
  };

  const stats = [
    {
      label: 'Status',
      value: plan?.status ?? '—',
      icon: faShieldHalved,
    },
    {
      label: 'Price / Order',
      value: plan
        ? `${plan.currency} ${Number(plan.pricePerOrder).toLocaleString()}`
        : '—',
      icon: faTag,
    },
    {
      label: 'Organizations',
      value: orgCount.toString(),
      icon: faBuilding,
    },
  ];

  if (isFetchingPlan && !plan) {
    return (
      <main className="w-full flex items-center justify-center py-16 min-h-screen">
        <p className="text-sm text-slate-500">Loading business plan…</p>
      </main>
    );
  }

  if (!plan && !isFetchingPlan) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 min-h-screen px-4">
        <p className="text-sm text-slate-500">Business plan not found.</p>
        <Button type="button" onClick={() => navigate(-1)}>Back</Button>
      </main>
    );
  }

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Business Plan Management"
          title={plan?.name ?? 'Business Plan'}
          description="Update plan details, view pricing, and see which organizations are assigned."
          actions={
            <Badge variant="outline" className="text-xs rounded-full px-3">
              {plan?.status ?? 'Unknown'}
            </Badge>
          }
        />
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <InternalStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={<FontAwesomeIcon icon={stat.icon} />}
          />
        ))}
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        {/* Left: Edit form */}
        <article className="lg:col-span-2 border border-slate-200 bg-white p-6">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Plan Details</p>
            <h2 className="mt-2 text-lg font-semibold text-[#25343F]">Edit Information</h2>
          </header>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    options={Object.values(BusinessPlanStatus).map((s) => ({
                      label: s.charAt(0) + s.slice(1).toLowerCase(),
                      value: s,
                    }))}
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
              <Button type="submit" primary isLoading={isUpdating} disabled={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </article>

        {/* Right: Organizations on this plan */}
        <aside className="flex flex-col gap-6">
          <article className="border border-slate-200 bg-white p-6">
            <header className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned To</p>
              <h2 className="mt-2 text-lg font-semibold text-[#25343F]">
                Organizations
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({orgCount})
                </span>
              </h2>
            </header>

            {isFetchingOrgs ? (
              <p className="text-sm text-slate-400">Loading organizations…</p>
            ) : orgsOnPlan.length === 0 ? (
              <p className="text-sm text-slate-400">No organizations on this plan.</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {orgsOnPlan.map((org) => (
                  <li
                    key={org.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <section>
                      <p className="text-sm font-medium text-[#25343F]">{org.name}</p>
                      <p className="text-xs text-slate-500">{org.email || '—'}</p>
                    </section>
                    <StatusBadge status={org.status} />
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Danger zone */}
          <article className="border border-red-200 bg-red-50 p-6">
            <header className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-400">Danger Zone</p>
              <h2 className="mt-2 text-lg font-semibold text-red-700">Delete Plan</h2>
            </header>
            <p className="text-xs text-red-500 mb-4">
              {orgCount > 0
                ? `This plan has ${orgCount} organization(s). Reassign them before deleting.`
                : 'Permanently removes this plan. This action cannot be undone.'}
            </p>
            <Button
              type="button"
              danger
              onClick={handleDelete}
              disabled={orgCount > 0 || isDeleting}
              isLoading={isDeleting}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete Plan
            </Button>
          </article>
        </aside>
      </motion.section>

      <motion.menu variants={itemVariants} className="flex items-center gap-3 pb-6">
        <Button type="button" onClick={() => navigate(-1)}>
          Back
        </Button>
      </motion.menu>
    </InternalPage>
  );
};

export default ManageBusinessPlanPage;
