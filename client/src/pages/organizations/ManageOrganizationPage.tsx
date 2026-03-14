import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faUsers,
  faCreditCard,
  faShieldHalved,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Badge } from '@/components/ui/badge';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  useFetchOrganizationByIdQuery,
  useFetchOrganizationMembersQuery,
} from '@/api/queries/organization.queries';
import { useFetchBusinessPlansQuery } from '@/api/queries/businessPlan.queries';
import {
  useUpdateOrganizationMutation,
  useAssignBusinessPlanMutation,
} from '@/api/mutations/organization.mutations';
import type { Organization } from '@/types/organization.type';
import { OrganizationStatus, BillingPeriod } from '@/types/organization.type';
import {
  InternalPage,
  InternalPageHeader,
  InternalStatCard,
} from '@/components/layout/InternalPage';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useDocumentTitle('Manage Organization');

  const { data: orgData, isFetching: isFetchingOrg } = useFetchOrganizationByIdQuery(id!, {
    skip: !id,
  });
  const { data: membersData, isFetching: isFetchingMembers } = useFetchOrganizationMembersQuery(
    { id: id!, page: 1, size: 50 },
    { skip: !id }
  );
  const { data: plansData } = useFetchBusinessPlansQuery();

  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  const [assignBusinessPlan, { isLoading: isAssigning }] = useAssignBusinessPlanMutation();

  const org: Organization | undefined = orgData?.data;
  const members = membersData?.data?.list ?? [];
  const businessPlans = plansData?.data?.list ?? [];

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
    if (org) {
      reset({
        name: org.name ?? '',
        description: org.description ?? '',
        email: org.email ?? '',
        phoneNumber: org.phoneNumber ?? '',
        address: org.address ?? '',
        tin: org.tin ?? '',
        status: org.status ?? OrganizationStatus.ACTIVE,
        billingPeriod: org?.billingPeriod ?? BillingPeriod.MONTHLY,
        paymentTermsDays: org?.paymentTermsDays ?? 30,
      });
      if (org.businessPlanId) {
        setSelectedPlanId(org.businessPlanId);
      }
    }
  }, [org, reset]);

  const onSubmitOrgInfo = handleSubmit(async (data) => {
    if (!id) return;
    try {
      await updateOrganization({ id, data }).unwrap();
      toast.success('Organization updated successfully.');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to update organization.';
      toast.error(message);
    }
  });

  const handleAssignPlan = async () => {
    if (!id || !selectedPlanId) return;
    try {
      await assignBusinessPlan({ id, businessPlanId: selectedPlanId }).unwrap();
      toast.success('Business plan assigned successfully.');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to assign business plan.';
      toast.error(message);
    }
  };

  const currentPlan = businessPlans.find((p) => p.id === org?.businessPlanId);

  const stats = [
    {
      label: 'Status',
      value: org?.status ?? '—',
      icon: faShieldHalved,
      iconBg: 'bg-primary-50 text-primary-900',
    },
    {
      label: 'Members',
      value: (membersData?.data?.totalCount ?? 0).toString(),
      icon: faUsers,
      iconBg: 'bg-secondary-50 text-secondary-800',
    },
    {
      label: 'Business Plan',
      value: currentPlan?.name ?? 'No plan assigned',
      icon: faCreditCard,
      iconBg: 'bg-amber-50 text-amber-700',
    },
  ];

  if (isFetchingOrg && !org) {
    return (
      <main className="w-full flex items-center justify-center py-16 min-h-screen">
        <p className="text-sm text-slate-500">Loading organization…</p>
      </main>
    );
  }

  if (!org && !isFetchingOrg) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 min-h-screen px-4">
        <p className="text-sm text-slate-500">Organization not found.</p>
        <Button type="button" onClick={() => navigate(-1)}>Back</Button>
      </main>
    );
  }

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Organization Management"
          title={org?.name ?? 'Organization'}
          description="Update organization details, assign a billing plan, and view members."
          actions={
            <Badge variant="outline" className="text-xs rounded-full px-3">
              {org?.status ?? 'Unknown'}
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
        <article className="lg:col-span-2 border border-slate-200 bg-white p-6">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Organization Details</p>
            <h2 className="mt-2 text-lg font-semibold text-[#25343F]">Edit Information</h2>
          </header>

          <form onSubmit={onSubmitOrgInfo} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required.' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Organization Name"
                    placeholder="Acme Logistics"
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
                    label="Email"
                    placeholder="ops@acme.com"
                    type="email"
                    errorMessage={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Phone Number"
                    placeholder="+250 7XX XXX XXX"
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
                    label="TIN"
                    placeholder="Tax Identification Number"
                    errorMessage={errors.tin?.message}
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                      Status
                    </label>
                    <select
                      {...field}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {Object.values(OrganizationStatus).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              />
              <Controller
                name="billingPeriod"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                      Billing Period
                    </label>
                    <select
                      {...field}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {Object.values(BillingPeriod).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                )}
              />
              <Controller
                name="paymentTermsDays"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Payment Terms (days)"
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
                  label="Address"
                  placeholder="123 Main St, Kigali"
                  errorMessage={errors.address?.message}
                />
              )}
            />

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
                    placeholder="Brief description of the organization..."
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
            />

            <div className="flex items-center gap-3">
              <Button type="submit" primary isLoading={isUpdating} disabled={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </article>

        {/* Right: Plan + Members */}
        <aside className="flex flex-col gap-6">
          {/* Business Plan */}
          <article className="border border-slate-200 bg-white p-6">
            <header className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Billing</p>
              <h2 className="mt-2 text-lg font-semibold text-[#25343F]">Business Plan</h2>
            </header>

            {currentPlan && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <FontAwesomeIcon icon={faTag} className="text-slate-700" />
                <section>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Current Plan</p>
                  <p className="text-sm font-semibold text-[#25343F]">{currentPlan.name}</p>
                  <p className="text-xs text-slate-500">
                    {currentPlan.currency} {Number(currentPlan.pricePerOrder).toLocaleString()} / order
                  </p>
                </section>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                  Assign Plan
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Select a plan —</option>
                  {businessPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.currency} {Number(plan.pricePerOrder).toLocaleString()}/order)
                    </option>
                  ))}
                </select>
              </div>
              <Button
                primary
                type="button"
                onClick={handleAssignPlan}
                disabled={!selectedPlanId || isAssigning}
                isLoading={isAssigning}
              >
                Assign Plan
              </Button>
            </div>
          </article>

          {/* Members */}
          <article className="border border-slate-200 bg-white p-6">
            <header className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Membership</p>
              <h2 className="mt-2 text-lg font-semibold text-[#25343F]">
                Members
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({membersData?.data?.totalCount ?? 0})
                </span>
              </h2>
            </header>

            {isFetchingMembers ? (
              <p className="text-sm text-slate-400">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-slate-400">No members found.</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <section>
                      <p className="text-sm font-medium text-[#25343F]">
                        {member.user?.name || member.user?.email || '—'}
                      </p>
                      <p className="text-xs text-slate-500">{member.user?.email || '—'}</p>
                    </section>
                    <span className="flex items-center gap-1">
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-700">
                        {member.role}
                      </span>
                      {member.status === 'ACTIVE' ? (
                        <FontAwesomeIcon icon={faCircleCheck} className="text-secondary-600 text-xs" />
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </aside>
      </motion.section>

      {/* Back button */}
      <motion.menu variants={itemVariants} className="flex items-center gap-3 pb-6">
        <Button type="button" onClick={() => navigate(-1)}>
          Back
        </Button>
      </motion.menu>
    </InternalPage>
  );
};

export default ManageOrganizationPage;
