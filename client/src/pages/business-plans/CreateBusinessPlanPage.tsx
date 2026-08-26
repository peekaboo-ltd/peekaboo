import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useCreateBusinessPlanMutation } from '@/api/mutations/businessPlan.mutations';
import type { CreateBusinessPlanPayload, PricingTier } from '@/types/businessPlan.type';
import { BusinessPlanStatus, BillingPeriod } from '@/types/businessPlan.type';
import {
  InternalPage,
  InternalPageHeader,
} from '@/components/layout/InternalPage';

interface FormValues extends Omit<CreateBusinessPlanPayload, 'features' | 'pricingTiers'> {
  features: { value: string }[];
  pricingTiers: PricingTier[];
  overflowRate: number | '';
  fallbackRate: number | '';
}

const CreateBusinessPlanPage = () => {
  useDocumentTitle('Create Business Plan');
  const navigate = useNavigate();

  const [createBusinessPlan, { isLoading }] = useCreateBusinessPlanMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: CreateBusinessPlanPayload = {
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

      await createBusinessPlan(payload).unwrap();
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
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    options={[
                      { label: 'Active', value: BusinessPlanStatus.ACTIVE },
                      { label: 'Inactive', value: BusinessPlanStatus.INACTIVE },
                    ]}
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
          </div>

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700 uppercase ">
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
              <h3 className="text-sm font-medium text-slate-800">Features</h3>
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
                <p className="text-xs text-slate-400 italic">
                  No features added yet. Click "Add Feature" to add bullet points.
                </p>
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
                <h3 className="text-sm font-medium text-slate-800">
                  Pricing Tiers
                </h3>
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
                  No pricing tiers defined. Click "Add Tier" to configure
                  volume-based pricing.
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
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="w-3.5 h-3.5"
                        />
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
                        rules={{
                          required: 'Min quantity is required.',
                          min: { value: 0, message: 'Must be >= 0' },
                        }}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            label="Min Quantity"
                            placeholder="0"
                            type="number"
                            required
                            onChange={(e) =>
                              inputField.onChange(Number(e.target.value))
                            }
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
                                e.target.value === ''
                                  ? null
                                  : Number(e.target.value)
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
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
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
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
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
                            onChange={(e) =>
                              checkboxField.onChange(e.target.checked)
                            }
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
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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
                          field.onChange(
                            e.target.value === ''
                              ? ''
                              : Number(e.target.value)
                          )
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
                        label="Fallback Rate (partial package delivery)"
                        placeholder="1600"
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? ''
                              : Number(e.target.value)
                          )
                        }
                      />
                    )}
                  />
                </div>
              )}
            </div>
          )}

          {/* Default Plan */}
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
            <Button
              type="submit"
              primary
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Plan
            </Button>
            <Button type="button" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </form>
      </section>
    </InternalPage>
  );
};

export default CreateBusinessPlanPage;
