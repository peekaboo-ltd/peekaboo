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
import { controlClassName } from '@/components/inputs/control';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/i18n';

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
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
  fallbackRate: number | '';
};

const ManageBusinessPlanPage = () => {
  const { t } = useI18n();
  const { id } = useParams<{ id: UUID }>();
  const navigate = useNavigate();
  useDocumentTitle(t('businessPlan.manageDocTitle'));

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
      fallbackRate: '',
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
        fallbackRate: plan.pricingTiers?.fallbackRate ?? '',
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
                fallbackRate: data.fallbackRate ? Number(data.fallbackRate) : undefined,
              }
            : undefined,
      };

      await updateBusinessPlan({ id, data: payload }).unwrap();
      toast.success(t('businessPlan.updated'));
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('businessPlan.updateError');
      toast.error(message);
    }
  });

  const handleDelete = async () => {
    if (!id) return;
    if (orgCount > 0) {
      toast.error(t('businessPlan.activeOrganizationsError'));
      return;
    }
    if (!window.confirm(t('businessPlan.confirmDeactivate', { name: plan?.name ?? '' }))) return;
    try {
      await deactivateBusinessPlan(id).unwrap();
      toast.success(t('businessPlan.deactivatedSuccess'));
      navigate('/business-plans');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('businessPlan.deactivateError');
      toast.error(message);
    }
  };

  // Build price display for stat card
  const priceDisplay = (() => {
    if (!plan) return '—';
    if (plan.isCustomPricing) return t('businessPlan.custom');
    if (plan.pricingTiers?.tiers?.length) {
      const tiers = plan.pricingTiers.tiers.filter((t) => !t.isCustom);
      if (tiers.length === 0) return t('businessPlan.custom');
      const prices = tiers
        .map((t) => t.pricePerUnit ?? (t.totalPrice && t.maxQuantity ? Math.round(t.totalPrice / (t.maxQuantity - t.minQuantity + 1)) : null))
        .filter((p): p is number => p != null);
      if (prices.length === 0) return t('businessPlan.custom');
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
      label: t('businessPlan.statusTab'),
      value: plan?.status ? t(`status.${plan.status.toLowerCase()}`) : '—',
      icon: faShieldHalved,
    },
    {
      label: t('businessPlan.pricingTab'),
      value: priceDisplay,
      icon: faTag,
    },
    {
      label: t('businessPlan.organizationsTab'),
      value: orgCount.toString(),
      icon: faBuilding,
    },
  ];

  if (isFetchingPlan && !plan) {
    return (
      <main className="w-full flex items-center justify-center py-16 min-h-screen">
        <p className="text-sm text-(--muted)">{t('businessPlan.loading')}</p>
      </main>
    );
  }

  if (!plan && !isFetchingPlan) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 min-h-screen px-4">
        <p className="text-sm text-(--muted)">{t('businessPlan.notFound')}</p>
        <Button type="button" onClick={() => navigate(-1)}>{t('businessPlan.back')}</Button>
      </main>
    );
  }

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow={t('businessPlan.managementEyebrow')}
          title={plan?.name ?? t('businessPlan.fallbackTitle')}
          description={t('businessPlan.manageDescription')}
          actions={
            <Badge variant="outline" className="text-xs rounded-full px-3">
              {plan?.status ? t(`status.${plan.status.toLowerCase()}`) : t('common.unknown')}
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
        <article className="lg:col-span-2 border border-(--line) bg-(--paper) p-6">
          <header className="mb-6">
            <p className="type-meta">{t('businessPlan.details')}</p>
            <h2 className="type-card-title mt-2">{t('businessPlan.editInformation')}</h2>
          </header>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('businessPlan.name')}
                    placeholder={t('businessPlan.namePlaceholder')}
                    required
                    errorMessage={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="currency"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('businessPlan.currency')}
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
                    label={t('businessPlan.billingPeriod')}
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { label: t('businessPlan.monthly'), value: BillingPeriod.MONTHLY },
                      { label: t('businessPlan.weekly'), value: BillingPeriod.WEEKLY },
                      { label: t('businessPlan.daily'), value: BillingPeriod.DAILY },
                    ]}
                    placeholder={t('businessPlan.selectBillingPeriod')}
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('common.status')}
                    value={field.value}
                    onChange={field.onChange}
                    options={Object.values(BusinessPlanStatus).map((s) => ({
                      label: t(`status.${s.toLowerCase()}`),
                      value: s,
                    }))}
                    placeholder={t('businessPlan.selectStatus')}
                  />
                )}
              />
              <Controller
                name="badge"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('businessPlan.badge')}
                    placeholder={t('businessPlan.badgePlaceholder')}
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
                  <label className="text-[0.8125rem] text-(--ink)">
                    {t('businessPlan.descriptionLabel')}
                  </label>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder={t('businessPlan.descriptionPlaceholder')}
                    className="rounded-lg border border-(--line) bg-(--paper) px-3 py-2 text-sm text-(--ink) resize-none focus:outline-none focus:ring-2 focus:ring-(--ink)"
                  />
                </div>
              )}
            />

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[0.8125rem] text-(--ink)">
                  {t('businessPlan.features')}
                </label>
                <button
                  type="button"
                  onClick={() => appendFeature({ value: '' })}
                  className="text-xs text-(--ink) hover:text-(--ink) flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  {t('businessPlan.addFeature')}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {featureFields.length === 0 && (
                  <p className="type-meta italic">{t('businessPlan.noFeatures')}</p>
                )}
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Controller
                      name={`features.${index}.value`}
                      control={control}
                      render={({ field: inputField }) => (
                        <input
                          {...inputField}
                          placeholder={t('businessPlan.featurePlaceholder', { number: index + 1 })}
                          className={cn(controlClassName, 'flex-1 px-3')}
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-(--muted) hover:text-(--ink) transition-colors"
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
                    className="size-5 rounded-(--radius-control) border border-(--ink) accent-(--ink)"
                  />
                  <span className="text-sm text-(--ink)">
                    {t('businessPlan.customPricing')}
                    <span className="type-meta ml-1">
                      {t('businessPlan.customPricingHint')}
                    </span>
                  </span>
                </label>
              )}
            />

            {/* Pricing Tiers */}
            {!isCustomPricing && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[0.8125rem] text-(--ink)">
                    {t('businessPlan.pricingTiers')}
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
                    className="text-xs text-(--ink) hover:text-(--ink) flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                    {t('businessPlan.addTier')}
                  </button>
                </div>

                {tierFields.length === 0 && (
                  <p className="type-meta italic">
                    {t('businessPlan.noTiers')}
                  </p>
                )}

                <div className="flex flex-col gap-3">
                  {tierFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg p-4 bg-(--surface)"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="type-meta">
                          {t('businessPlan.tier', { number: index + 1 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="p-1 text-(--muted) hover:text-(--ink) transition-colors"
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
                              label={t('businessPlan.tierLabel')}
                              placeholder={t('businessPlan.tierLabelPlaceholder')}
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
                              label={t('businessPlan.minQuantity')}
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
                              label={t('businessPlan.maxQuantity')}
                              placeholder={t('businessPlan.unlimitedPlaceholder')}
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
                              label={t('businessPlan.pricePerUnit')}
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
                              label={t('businessPlan.packageTotal')}
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
                              className="size-5 rounded-(--radius-control) border border-(--ink) accent-(--ink)"
                            />
                            <span className="type-meta">
                              {t('businessPlan.customTier')}
                            </span>
                          </label>
                        )}
                      />
                    </div>
                  ))}
                </div>

                {tierFields.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Controller
                      name="overflowRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label={t('businessPlan.overflowRate')}
                          placeholder="1500"
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                          }
                        />
                      )}
                    />
                    <Controller
                      name="fallbackRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label={t('businessPlan.fallbackRate')}
                          placeholder="1600"
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
                    className="size-5 rounded-(--radius-control) border border-(--ink) accent-(--ink)"
                  />
                  <span className="text-sm text-(--ink)">
                    {t('businessPlan.setDefault')}
                    <span className="type-meta ml-1">
                      {t('businessPlan.defaultHint')}
                    </span>
                  </span>
                </label>
              )}
            />

            <div className="flex items-center gap-3">
              <Button type="submit" primary isLoading={isUpdating} disabled={isUpdating}>
                {t('businessPlan.saveChanges')}
              </Button>
            </div>
          </form>
        </article>

        {/* Right: Organizations on this plan */}
        <aside className="flex flex-col gap-6">
          <article className="border border-(--line) bg-(--paper) p-6">
            <header className="mb-4">
              <p className="type-meta">{t('businessPlan.assignedTo')}</p>
              <h2 className="type-card-title mt-2">
                {t('businessPlan.organizations')}
                <span className="ml-2 text-sm font-normal text-(--muted)">
                  ({orgCount})
                </span>
              </h2>
            </header>

            {isFetchingOrgs ? (
              <p className="text-sm text-(--muted)">{t('businessPlan.loadingOrganizations')}</p>
            ) : orgsOnPlan.length === 0 ? (
              <p className="text-sm text-(--muted)">{t('businessPlan.noOrganizations')}</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {orgsOnPlan.map((org) => (
                  <li
                    key={org.id}
                    className="flex items-center justify-between rounded-lg bg-(--surface) px-3 py-2"
                  >
                    <section>
                      <p className="text-sm font-normal text-(--ink)">{org.name}</p>
                      <p className="type-meta">{org.email || '—'}</p>
                    </section>
                    <StatusBadge status={org.status} />
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Danger zone */}
          <article className="bg-(--surface) p-6">
            <header className="mb-4">
              <p className="text-[0.8125rem] text-(--ink)">{t('businessPlan.dangerZone')}</p>
              <h2 className="type-card-title mt-2">{t('businessPlan.delete')}</h2>
            </header>
            <p className="text-xs text-(--ink) mb-4">
              {orgCount > 0
                ? t('businessPlan.hasOrganizations', { count: orgCount })
                : t('businessPlan.deactivateDescription')}
            </p>
            <Button
              type="button"
              danger
              onClick={handleDelete}
              disabled={orgCount > 0 || isDeactivating}
              isLoading={isDeactivating}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              {t('businessPlan.deactivate')}
            </Button>
          </article>
        </aside>
      </motion.section>

      <motion.menu variants={itemVariants} className="flex items-center gap-3 pb-6">
        <Button type="button" onClick={() => navigate(-1)}>
          {t('businessPlan.back')}
        </Button>
      </motion.menu>
    </InternalPage>
  );
};

export default ManageBusinessPlanPage;
