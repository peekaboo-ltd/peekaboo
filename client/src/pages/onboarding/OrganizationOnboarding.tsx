import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { useState, useCallback } from 'react';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faArrowRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrganizationData } from '@/states/slices/onboarding.slice';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import type { OrganizationFormData } from '@/types/organization.type';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// Step Progress Indicator Component
const StepProgress = ({ currentStep }: { currentStep: 1 | 2 | 3 }) => {
  return (
    <nav className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <motion.span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              currentStep >= step
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}
            animate={{ scale: currentStep === step ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep > step ? (
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
            ) : (
              step
            )}
          </motion.span>
          {step < 3 && (
            <div
              className={`w-12 h-0.5 mx-1 transition-colors ${
                currentStep > step ? 'bg-primary-600' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </nav>
  );
};

const OrganizationOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { organization } = useAppSelector((state) => state.onboarding);
  const { t } = useI18n();
  const [phoneError, setPhoneError] = useState<string | undefined>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    defaultValues: organization,
  });

  // Handle phone validation on change
  const handlePhoneChange = useCallback(
    (value: string, onChange: (value: string) => void) => {
      onChange(value);
      if (value) {
        const validation = validateAndFormatPhoneNumber(value);
        setPhoneError(validation.isValid ? undefined : validation.error);
      } else {
        setPhoneError(undefined);
      }
    },
    []
  );

  const onSubmit = handleSubmit((data) => {
    // Validate phone
    const phoneValidation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      return;
    }

    dispatch(
      setOrganizationData({
        ...data,
        phoneNumber: phoneValidation.formattedNumber!,
      })
    );
    navigate('/onboarding/admin');
  });

  return (
    <motion.main
      className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <article className="max-w-4xl mx-auto flex flex-col gap-8">
        <motion.div variants={itemVariants}>
          <StepProgress currentStep={1} />
        </motion.div>

        <motion.header variants={itemVariants} className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-primary-600">
            {t('onboarding.step', { step: 1 })}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t('onboarding.organization.title')}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {t('onboarding.organization.subtitle')}
          </p>
          <Link
            to="/auth/login"
            className="text-sm font-medium text-primary-700 hover:text-primary-800 w-fit transition-colors"
          >
            {t('onboarding.organization.signIn')}
          </Link>
        </motion.header>

        <motion.form
          variants={cardVariants}
          onSubmit={onSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 space-y-6"
        >
          <section className="flex items-center gap-3 text-slate-800">
            <motion.span
              className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <FontAwesomeIcon icon={faBuilding} className="text-primary-600" />
            </motion.span>
            <div>
              <h2 className="text-lg font-semibold">
                {t('onboarding.organization.detailsTitle')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('onboarding.organization.detailsSubtitle')}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              rules={{ required: t('validation.required') }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('onboarding.organization.name')}
                  placeholder={t('onboarding.organization.namePlaceholder')}
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
                  label={t('onboarding.organization.email')}
                  placeholder={t('onboarding.organization.emailPlaceholder')}
                  type="email"
                  required
                  errorMessage={errors?.email?.message}
                />
              )}
            />
            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: t('validation.required') }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('onboarding.organization.phone')}
                  placeholder={t('onboarding.organization.phonePlaceholder')}
                  required
                  onChange={(e) =>
                    handlePhoneChange(e.target.value, field.onChange)
                  }
                  errorMessage={phoneError || errors?.phoneNumber?.message}
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('onboarding.organization.location')}
                  placeholder={t('onboarding.organization.locationPlaceholder')}
                />
              )}
            />
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('onboarding.organization.industry')}
                  placeholder={t('onboarding.organization.industryPlaceholder')}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    {
                      value: 'ecommerce',
                      label: t('onboarding.organization.industryOptionEcommerce'),
                    },
                    {
                      value: 'retail',
                      label: t('onboarding.organization.industryOptionRetail'),
                    },
                    {
                      value: 'restaurants',
                      label: t('onboarding.organization.industryOptionRestaurants'),
                    },
                    {
                      value: 'pharmacy',
                      label: t('onboarding.organization.industryOptionPharmacy'),
                    },
                  ]}
                />
              )}
            />
            <Controller
              name="deliveryVolume"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('onboarding.organization.volume')}
                  placeholder={t('onboarding.organization.volumePlaceholder')}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    {
                      value: '0-200',
                      label: t('onboarding.organization.volumeOptionSmall'),
                    },
                    {
                      value: '200-800',
                      label: t('onboarding.organization.volumeOptionMedium'),
                    },
                    {
                      value: '800+',
                      label: t('onboarding.organization.volumeOptionLarge'),
                    },
                  ]}
                />
              )}
            />
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t('onboarding.organization.backHome')}
            </Link>
            <Button type="submit" primary className="px-6">
              {t('onboarding.organization.continue')}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
            </Button>
          </footer>
        </motion.form>
      </article>
    </motion.main>
  );
};

export default OrganizationOnboarding;
