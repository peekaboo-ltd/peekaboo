import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faBuilding,
  faShieldHalved,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchBusinessPlanByIdQuery, useFetchBusinessPlanOrganizationCountQuery } from '@/api/queries/businessPlan.queries';
import { useUpdateBusinessPlanMutation, useDeactivateBusinessPlanMutation } from '@/api/mutations/businessPlan.mutations';
import { useFetchOrganizationsQuery } from '@/api/queries/organization.queries';
import type { UpdateBusinessPlanPayload, PricingTier } from '@/types/businessPlan.type';
import { BusinessPlanStatus, BillingPeriod } from '@/types/businessPlan.type';
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
  currency: string;
  billingPeriod: BillingPeriod;
  status: BusinessPlanStatus;
  isDefault: boolean;
  isCustomPricing: boolean;
  badge?: string;
  features: { value: string }[];
  pricingTiers: PricingTier[];
  overflowRate: number | '';
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
  const [deactivateBusinessPlan, { isLoading: isDeactivating }] = useDeactivateBusinessPlanMutation();

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
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    defaultValues: {
      name: '',
      description: '',
      currency: 'RWF',
      billingPeriod: BillingPeriod.MONTHLY,
      status: BusinessPlanStatus.ACTIVE,
      isDefault: false,
      isCustomPricing: false,
      badge: '',
      features: [],
      pricingTiers: [],
      overflowRate: '',
    },
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control, name: 'features' });

  const {
    fields: tierFields,
    append: appendTier,
    remove: removeTier,
  } = useFieldArray({ control, name: 'pricingTiers' });

  const isCustomPricing = watch('isCustomPricing');

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name ?? '',
        description: plan.description ?? '',
        currency: plan.currency ?? 'RWF',
        billingPeriod: plan.billingPeriod ?? BillingPeriod.MONTHLY,
        status: plan.status ?? BusinessPlanStatus.ACTIVE,
        isDefault: plan.isDefault ?? false,
        isCustomPricing: plan.isCustomPricing ?? false,
        badge: plan.badge ?? '',
        features: (plan.features ?? []).map((f: string) => ({ value: f })),
        pricingTiers: plan.pricingTiers?.tiers ?? [],
        overflowRate: plan.pricingTiers?.overflowRate ?? '',
      });
    }
  }, [plan, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!id) return;
    try {
      const payload: UpdateBusinessPlanPayload = {
        name: data.name,
        description: data.description,
        currency: data.currency,
        billingPeriod: data.billingPeriod,
        status: data.status,
        isDefault: data.isDefault,
        isCustomPricing: data.isCustomPricing,
        badge: data.badge || undefined,
        features: data.features.map((f) => f.value).filter(Boolean),
        pricingTiers:
          !data.isCustomPricing && data.pricingTiers.length > 0
            ? {
                tiers: data.pricingTiers,
                overflowRate: data.overflowRate ? Number(data.overflowRate) : undefined,
              }
            : undefined,
      };

      await updateBusinessPlan({ id, data: payload }).unwrap();
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
    if (!window.confirm(`Move plan "${plan?.name}" to deactivated plans? You can restore it later.`)) return;
    try {
      await deactivateBusinessPlan(id).unwrap();
      toast.success('Business plan moved to deactivated plans.');
      navigate('/business-plans');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to delete business plan.';
      toast.error(message);
    }
  };

  // Build price display for stat card
  const priceDisplay = (() => {
    if (!plan) return '—';
    if (plan.isCustomPricing) return 'Custom';
    if (plan.pricingTiers?.tiers?.length) {
      const tiers = plan.pricingTiers.tiers.filter((t) => !t.isCustom);
      if (tiers.length === 0) return 'Custom';
      const prices = tiers
        .map((t) => t.pricePerUnit ?? (t.totalPrice && t.maxQuantity ? Math.round(t.totalPrice / (t.maxQuantity - t.minQuantity + 1)) : null))
        .filter((p): p is number => p != null);
      if (prices.length === 0) return 'Custom';
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max
        ? `${plan.currency} ${min.toLocaleString()}`
        : `${plan.currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
    }
    if (plan.pricePerOrder != null) {
      return `${plan.currency} ${Number(plan.pricePerOrder).toLocaleString()}`;
    }
    return '—';
  })();

  const stats = [
    {
      label: 'Status',
      value: plan?.status ?? '—',
      icon: faShieldHalved,
    },
    {
      label: 'Pricing',
      value: priceDisplay,
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
                    placeholder="Business Growth Plan"
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
                name="billingPeriod"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Billing Period"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { label: 'Monthly', value: BillingPeriod.MONTHLY },
                      { label: 'Weekly', value: BillingPeriod.WEEKLY },
                      { label: 'Daily', value: BillingPeriod.DAILY },
                    ]}
                    placeholder="Select billing period"
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
              <Controller
                name="badge"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Badge"
                    placeholder="MOST POPULAR"
                    value={field.value || ''}
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

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                  Features
                </label>
                <button
                  type="button"
                  onClick={() => appendFeature({ value: '' })}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  Add Feature
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {featureFields.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No features added.</p>
                )}
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Controller
                      name={`features.${index}.value`}
                      control={control}
                      render={({ field: inputField }) => (
                        <input
                          {...inputField}
                          placeholder={`Feature ${index + 1}...`}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Pricing Toggle */}
            <Controller
              name="isCustomPricing"
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
                    Custom pricing
                    <span className="ml-1 text-xs text-slate-400">
                      (negotiated pricing — hides tier configuration)
                    </span>
                  </span>
                </label>
              )}
            />

            {/* Pricing Tiers */}
            {!isCustomPricing && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                    Pricing Tiers
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      appendTier({
                        minQuantity: 0,
                        maxQuantity: null,
                        pricePerUnit: undefined,
                        totalPrice: undefined,
                        label: '',
                        isCustom: false,
                      })
                    }
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                    Add Tier
                  </button>
                </div>

                {tierFields.length === 0 && (
                  <p className="text-xs text-slate-400 italic">
                    No pricing tiers defined.
                  </p>
                )}

                <div className="flex flex-col gap-3">
                  {tierFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-500 uppercase">
                          Tier {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Controller
                          name={`pricingTiers.${index}.label`}
                          control={control}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              label="Label"
                              placeholder="0 – 150 deliveries per month"
                              value={inputField.value || ''}
                            />
                          )}
                        />
                        <Controller
                          name={`pricingTiers.${index}.minQuantity`}
                          control={control}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              label="Min Quantity"
                              placeholder="0"
                              type="number"
                              required
                              onChange={(e) => inputField.onChange(Number(e.target.value))}
                            />
                          )}
                        />
                        <Controller
                          name={`pricingTiers.${index}.maxQuantity`}
                          control={control}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              label="Max Quantity"
                              placeholder="Leave empty for unlimited"
                              type="number"
                              value={inputField.value ?? ''}
                              onChange={(e) =>
                                inputField.onChange(
                                  e.target.value === '' ? null : Number(e.target.value)
                                )
                              }
                            />
                          )}
                        />
                        <Controller
                          name={`pricingTiers.${index}.pricePerUnit`}
                          control={control}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              label="Price Per Unit"
                              placeholder="1500"
                              type="number"
                              value={inputField.value ?? ''}
                              onChange={(e) =>
                                inputField.onChange(
                                  e.target.value === '' ? undefined : Number(e.target.value)
                                )
                              }
                            />
                          )}
                        />
                        <Controller
                          name={`pricingTiers.${index}.totalPrice`}
                          control={control}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              label="Total Price (Package)"
                              placeholder="48000"
                              type="number"
                              value={inputField.value ?? ''}
                              onChange={(e) =>
                                inputField.onChange(
                                  e.target.value === '' ? undefined : Number(e.target.value)
                                )
                              }
                            />
                          )}
                        />
                      </div>

                      <Controller
                        name={`pricingTiers.${index}.isCustom`}
                        control={control}
                        render={({ field: checkboxField }) => (
                          <label className="flex items-center gap-2 cursor-pointer mt-3">
                            <input
                              type="checkbox"
                              checked={checkboxField.value || false}
                              onChange={(e) => checkboxField.onChange(e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30"
                            />
                            <span className="text-xs text-slate-500">
                              Custom / contact us tier
                            </span>
                          </label>
                        )}
                      />
                    </div>
                  ))}
                </div>

                {tierFields.length > 0 && (
                  <div className="mt-3">
                    <Controller
                      name="overflowRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Overflow Rate (per extra delivery)"
                          placeholder="1500"
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                          }
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            )}

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
                : 'Moves this plan to deactivated plans. You can restore it there or permanently delete it.'}
            </p>
            <Button
              type="button"
              danger
              onClick={handleDelete}
              disabled={orgCount > 0 || isDeactivating}
              isLoading={isDeactivating}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Deactivate Plan
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
