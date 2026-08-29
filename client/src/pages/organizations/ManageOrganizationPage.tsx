import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faShieldHalved,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import Select from '@/components/inputs/Select';
import { Badge } from '@/components/ui/badge';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  useUpdateOrganizationMutation,
  useAssignBusinessPlanMutation,
} from '@/api/mutations/organization.mutations';
import { OrganizationStatus, BillingPeriod } from '@/types/organization.type';
import {
  InternalPage,
  InternalPageHeader,
  InternalStatCard,
} from '@/components/layout/InternalPage';
import { useFetchOrganizationById } from '@/hooks/organization/organization.hooks';
import { useAppSelector } from '@/states/hooks';
import { useFetchBusinessPlans } from '@/hooks/business-plan/businessPlan.hooks';
import { BusinessPlan } from '@/types/businessPlan.type';
import { UUID } from '@/types';
import OrganizationMembers from '@/containers/organizations/OrganizationMembers';
import { validateRwandanPhoneNumber } from '@/utils/phone.util';
import { useI18n } from '@/i18n/i18n';

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

type OrgFormValues = {
  name: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  tin?: string;
  status: OrganizationStatus;
  billingPeriod?: BillingPeriod;
  paymentTermsDays?: number;
};

const ManageOrganizationPage = () => {
  const { t } = useI18n();

  // NAVIGATION
  const { id } = useParams<{ id: UUID }>();
  const navigate = useNavigate();
  useDocumentTitle(t('organization.manageDocTitle'));

  // STATE VARIABLES
  const { organization } = useAppSelector((state) => state.organization);
  const { businessPlansList } = useAppSelector((state) => state.businessPlan);
  const [currentBusinessPlan, setCurrentBusinessPlan] = useState<BusinessPlan | undefined>(undefined);

  const { fetchOrganizationById, isFetching: organizationIsFetching } = useFetchOrganizationById();
  const { fetchBusinessPlans, page: businessPlansPage, size: businessPlansSize } = useFetchBusinessPlans();

  // FETCH ORGANIZATION AND MEMBERS
  useEffect(() => {
    if (id) {
      fetchOrganizationById(id);
    }
  }, [id, fetchOrganizationById]);

  useEffect(() => {
    fetchBusinessPlans({ page: businessPlansPage, size: businessPlansSize });
  }, [businessPlansPage, businessPlansSize, fetchBusinessPlans]);

  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  const [assignBusinessPlan, { isLoading: isAssigning }] = useAssignBusinessPlanMutation();

  // SET CURRENT BUSINESS PLAN
  useEffect(() => {
    if (organization?.businessPlanId) {
      setCurrentBusinessPlan(businessPlansList.find((plan) => plan?.id === organization?.businessPlanId) ?? undefined);
    }
  }, [organization?.businessPlanId, businessPlansList]);

  // FORM HANDLING
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrgFormValues>({
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phoneNumber: '',
      address: '',
      tin: '',
      status: OrganizationStatus.ACTIVE,
      billingPeriod: BillingPeriod.MONTHLY,
      paymentTermsDays: 30,
    },
  });

  // Selected plan state for assignment
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name ?? '',
        description: organization.description ?? '',
        email: organization.email ?? '',
        phoneNumber: organization.phoneNumber ?? '',
        address: organization.address ?? '',
        tin: organization.tin ?? '',
        status: organization.status ?? OrganizationStatus.ACTIVE,
        billingPeriod: organization?.billingPeriod ?? BillingPeriod.MONTHLY,
        paymentTermsDays: organization?.paymentTermsDays ?? 30,
      });
      if (organization?.businessPlanId) {
        setSelectedPlanId(organization?.businessPlanId);
      }
    }
  }, [organization, reset]);

  const onSubmitOrgInfo = handleSubmit(async (data) => {
    if (!id) return;
    try {
      await updateOrganization({ id, data }).unwrap();
      toast.success(t('organization.updated'));
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('organization.updateError');
      toast.error(message);
    }
  });

  const handleAssignPlan = async () => {
    if (!id || !selectedPlanId) return;
    try {
      await assignBusinessPlan({ id, businessPlanId: selectedPlanId }).unwrap();
      toast.success(t('organization.planAssigned'));
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('organization.planAssignError');
      toast.error(message);
    }
  };

  const stats = [
    {
      label: t('common.status'),
      value: organization?.status ? t(`status.${organization.status.toLowerCase()}`) : '—',
      icon: faShieldHalved,
      iconBg: 'bg-(--ink) text-(--paper)',
    },
    {
      label: t('businessPlans.title'),
      value: currentBusinessPlan?.name ?? t('organization.noPlan'),
      icon: faCreditCard,
      iconBg: 'bg-(--surface) text-(--ink)',
    },
  ];

  if (organizationIsFetching && !organization) {
    return (
      <main className="w-full flex items-center justify-center py-16 min-h-screen">
        <p className="text-sm text-(--muted)">{t('organization.loading')}</p>
      </main>
    );
  }

  if (!organization && !organizationIsFetching) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 min-h-screen px-4">
        <p className="text-sm text-(--muted)">{t('organization.notFound')}</p>
        <Button type="button" onClick={() => navigate(-1)}>{t('organization.back')}</Button>
      </main>
    );
  }

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow={t('organization.management')}
          title={organization?.name ?? t('organization.fallbackTitle')}
          description={t('organization.manageDescription')}
          actions={
            <Badge variant="outline" className="text-xs rounded-full px-3">
              {organization?.status ? t(`status.${organization.status.toLowerCase()}`) : t('common.unknown')}
            </Badge>
          }
        />
      </motion.section>

      {/* Stats row */}
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

      {/* Main content */}
      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        {/* Left: Edit form */}
        <article className="lg:col-span-2 border border-(--line) bg-(--paper) p-6">
          <header className="mb-6">
            <p className="type-meta">{t('organization.details')}</p>
            <h2 className="type-card-title mt-2">{t('organization.editInformation')}</h2>
          </header>

          <form onSubmit={onSubmitOrgInfo} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    errorMessage={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.emailLabel')}
                    placeholder={t('organization.emailPlaceholder')}
                    type="email"
                    errorMessage={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  validate: (value) => validateRwandanPhoneNumber(value, false),
                }}
                render={({ field }) => (
                  <TelInput
                    {...field}
                    label={t('organization.phone')}
                    placeholder={t('organization.phonePlaceholder')}
                    errorMessage={errors.phoneNumber?.message}
                  />
                )}
              />
              <Controller
                name="tin"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.tin')}
                    placeholder={t('organization.tin')}
                    errorMessage={errors.tin?.message}
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
                    options={Object.values(OrganizationStatus).map((s) => ({
                      label: t(`status.${s.toLowerCase()}`),
                      value: s,
                    }))}
                    placeholder={t('organization.selectStatus')}
                  />
                )}
              />
              <Controller
                name="billingPeriod"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('organization.billingPeriod')}
                    value={field.value}
                    onChange={field.onChange}
                    options={Object.values(BillingPeriod).map((p) => ({
                      label: t(`businessPlan.${p.toLowerCase()}`),
                      value: p,
                    }))}
                    placeholder={t('organization.selectBillingPeriod')}
                  />
                )}
              />
              <Controller
                name="paymentTermsDays"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('organization.paymentTerms')}
                    placeholder="30"
                    type="number"
                    errorMessage={errors.paymentTermsDays?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('organization.address')}
                  placeholder={t('organization.addressPlaceholder')}
                  errorMessage={errors.address?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-[0.8125rem] text-(--ink)">
                    {t('organization.descriptionLabel')}
                  </label>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder={t('organization.descriptionPlaceholder')}
                    className="rounded-lg border border-(--line) bg-(--paper) px-3 py-2 text-sm text-(--ink) resize-none focus:outline-none focus:ring-2 focus:ring-(--ink)"
                  />
                </div>
              )}
            />

            <div className="flex items-center gap-3">
              <Button type="submit" primary isLoading={isUpdating} disabled={isUpdating}>
                {t('organization.saveChanges')}
              </Button>
            </div>
          </form>
        </article>

        {/* Right: Plan + Members */}
        <aside className="flex flex-col gap-6">
          {/* Business Plan */}
          <article className="border border-(--line) bg-(--paper) p-6">
            <header className="mb-4">
              <p className="type-meta">{t('organization.billing')}</p>
              <h2 className="type-card-title mt-2">{t('businessPlans.title')}</h2>
            </header>

            {currentBusinessPlan && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-(--surface) px-4 py-3">
                <FontAwesomeIcon icon={faTag} className="text-(--ink)" />
                <section>
                  <p className="type-meta">{t('organization.currentPlan')}</p>
                  <p className="text-sm font-normal text-(--ink)">{currentBusinessPlan.name}</p>
                  <p className="type-meta">
                    {currentBusinessPlan.isCustomPricing
                      ? t('businessPlan.customPricing')
                      : currentBusinessPlan.pricePerOrder != null
                        ? t('businessPlan.perOrder', { currency: currentBusinessPlan.currency, price: Number(currentBusinessPlan.pricePerOrder).toLocaleString() })
                        : currentBusinessPlan.billingPeriod ? t(`businessPlan.${currentBusinessPlan.billingPeriod.toLowerCase()}`) : t('organization.volumePricing')}
                  </p>
                </section>
              </div>
            )}

            <fieldset className="flex flex-col gap-3">
              <Select
                label={t('organization.assignPlan')}
                value={selectedPlanId}
                onChange={(value) => setSelectedPlanId(value)}
                options={businessPlansList.map((plan) => ({
                  label: plan.isCustomPricing
                    ? `${plan.name} (${t('businessPlan.customPricing')})`
                    : plan.pricePerOrder != null
                      ? `${plan.name} (${t('businessPlan.perOrder', { currency: plan.currency, price: Number(plan.pricePerOrder).toLocaleString() })})`
                      : `${plan.name} (${plan.billingPeriod ? t(`businessPlan.${plan.billingPeriod.toLowerCase()}`) : t('organization.volumePricing')})`,
                  value: plan?.id ?? '',
                }))}
                placeholder={t('organization.selectPlan')}
              />
              <Button
                primary
                type="button"
                onClick={handleAssignPlan}
                disabled={!selectedPlanId || isAssigning}
                isLoading={isAssigning}
              >
                {t('organization.assignPlan')}
              </Button>
            </fieldset>
          </article>
        </aside>
      </motion.section>

      <OrganizationMembers organizationId={id} />

      {/* Back button */}
      <motion.menu variants={itemVariants} className="flex items-center gap-3 pb-6">
        <Button type="button" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
          {t('organization.back')}
        </Button>
      </motion.menu>
    </InternalPage>
  );
};

export default ManageOrganizationPage;
