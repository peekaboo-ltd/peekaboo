import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { useEffect } from 'react';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faArrowRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setAdminData } from '@/states/slices/onboarding.slice';
import {
  validateAndFormatPhoneNumber,
  validateRwandanPhoneNumber,
} from '@/utils/phone.util';
import type { AdminFormData } from '@/types/organization.type';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

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

const AdminOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { organization, admin } = useAppSelector((state) => state.onboarding);
  const { t } = useI18n();
  useDocumentTitle(t('onboarding.admin.title'));

  // Redirect to step 1 if organization data is missing
  useEffect(() => {
    if (!organization.name) {
      navigate('/onboarding/organization');
    }
  }, [organization, navigate]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<AdminFormData>({
    defaultValues: admin,
  });

  // Watch password for confirmation validation
  const password = watch('password');

  const onSubmit = handleSubmit((data) => {
    // Validate phone
    const phoneValidation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!phoneValidation.isValid) {
      setError('phoneNumber', {
        type: 'validate',
        message: phoneValidation.error,
      });
      return;
    }

    dispatch(
      setAdminData({
        ...data,
        phoneNumber: phoneValidation.e164!,
      })
    );
    navigate('/onboarding/users');
  });

  return (
    <motion.main
      className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <article className="max-w-4xl mx-auto flex flex-col gap-8">
        <motion.div variants={itemVariants}>
          <StepProgress currentStep={2} />
        </motion.div>

        <motion.header variants={itemVariants} className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-black">
            {t('onboarding.step', { step: 2 })}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t('onboarding.admin.title')}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {t('onboarding.admin.subtitle')}
          </p>
        </motion.header>

        <motion.form
          variants={cardVariants}
          onSubmit={onSubmit}
          className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6"
        >
          <section className="flex items-center gap-3 text-slate-800">
            <motion.span
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <FontAwesomeIcon
                icon={faUserShield}
                className="text-black"
              />
            </motion.span>
            <div>
              <h2 className="text-lg font-semibold">
                {t('onboarding.admin.detailsTitle')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('onboarding.admin.detailsSubtitle')}
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
                  label={t('onboarding.admin.name')}
                  placeholder={t('onboarding.admin.namePlaceholder')}
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
                  label={t('onboarding.admin.email')}
                  placeholder={t('onboarding.admin.emailPlaceholder')}
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
                  label={t('onboarding.admin.phone')}
                  placeholder={t('onboarding.admin.phonePlaceholder')}
                  required
                  errorMessage={errors?.phoneNumber?.message}
                />
              )}
            />
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('onboarding.admin.titleField')}
                  placeholder={t('onboarding.admin.titlePlaceholder')}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{
                required: t('validation.required'),
                minLength: {
                  value: 8,
                  message: t('validation.passwordMinLength'),
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('onboarding.admin.password')}
                  placeholder={t('onboarding.admin.passwordPlaceholder')}
                  type="password"
                  required
                  errorMessage={errors?.password?.message}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: (value) =>
                  value === password || t('validation.passwordMismatch'),
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('onboarding.admin.confirmPassword')}
                  placeholder={t('onboarding.admin.confirmPasswordPlaceholder')}
                  type="password"
                  required
                  errorMessage={errors?.confirmPassword?.message}
                />
              )}
            />
          </div>

          <aside className="text-xs text-slate-500 -mt-2">
            {t('onboarding.admin.passwordHint')}
          </aside>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link
              to="/onboarding/organization"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t('onboarding.admin.back')}
            </Link>
            <Button type="submit" primary className="px-6">
              {t('onboarding.admin.continue')}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
            </Button>
          </footer>
        </motion.form>
      </article>
    </motion.main>
  );
};

export default AdminOnboarding;
