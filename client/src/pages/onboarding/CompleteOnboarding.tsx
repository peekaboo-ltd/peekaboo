import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCheck,
  faLock,
  faPhone,
  faUser,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import {
  useValidateOnboardingTokenQuery,
  useCompleteOnboardingMutation,
} from '@/api/mutations/organization.mutations';
import { useAppDispatch } from '@/states/hooks';
import { setToken, setUser, setIsAuthenticated } from '@/states/slices/auth.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import { useI18n } from '@/i18n/i18n';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';

interface CompleteOnboardingFormData {
  adminName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  orgAddress: string;
  orgDescription: string;
}

const CompleteOnboarding = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = searchParams.get('token') || '';
  const [completed, setCompleted] = useState(false);

  const {
    data: tokenData,
    isLoading: isValidating,
    isError: isTokenInvalid,
  } = useValidateOnboardingTokenQuery(token, { skip: !token });

  const [completeOnboarding, { isLoading: isSubmitting }] =
    useCompleteOnboardingMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompleteOnboardingFormData>({
    defaultValues: {
      adminName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      orgAddress: '',
      orgDescription: '',
    },
  });

  const password = watch('password');

  const onSubmit = handleSubmit(async (data) => {
    const phone = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!phone.formattedNumber) return;

    try {
      const result = await completeOnboarding({
        token,
        password: data.password,
        phoneNumber: phone.formattedNumber,
        adminName: data.adminName || undefined,
        organizationDetails: {
          address: data.orgAddress || undefined,
          description: data.orgDescription || undefined,
        },
      }).unwrap();

      // Store auth data
      localStorageUtil.setItem('token', result.data.auth.token);
      localStorageUtil.setItem('user', result.data.auth.user);

      // Update Redux state
      dispatch(setToken(result.data.auth.token));
      dispatch(setUser(result.data.auth.user));
      dispatch(setIsAuthenticated(true));

      setCompleted(true);
    } catch {
      // Error handled by RTK Query
    }
  });

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => navigate('/dashboard'), 3000);
      return () => clearTimeout(timer);
    }
  }, [completed, navigate]);

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {t('completeOnboarding.noToken')}
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            {t('completeOnboarding.noTokenDesc')}
          </p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {t('onboarding.organization.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm">{t('completeOnboarding.validating')}</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (isTokenInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {t('completeOnboarding.invalidToken')}
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            {t('completeOnboarding.invalidTokenDesc')}
          </p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {t('onboarding.organization.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Completed
  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCheck} className="text-green-600 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {t('completeOnboarding.successTitle')}
          </h2>
          <p className="text-slate-600 mb-6">
            {t('completeOnboarding.successMessage')}
          </p>
          <p className="text-sm text-slate-400">
            {t('completeOnboarding.redirecting')}
          </p>
        </motion.div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="text-primary-600 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {t('completeOnboarding.title')}
              </h1>
              <p className="text-sm text-slate-500">
                {tokenData?.data?.organizationName && (
                  <span className="font-medium text-slate-700">
                    {tokenData.data.organizationName}
                  </span>
                )}
                {' - '}
                {t('completeOnboarding.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Admin Details */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faUser} className="text-slate-400 text-sm" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  {t('completeOnboarding.adminSection')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="adminName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t('onboarding.admin.name')}
                      placeholder={t('onboarding.admin.namePlaceholder')}
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
                      label={t('onboarding.admin.phone')}
                      placeholder={t('onboarding.admin.phonePlaceholder')}
                      required
                      errorMessage={errors?.phoneNumber?.message}
                    />
                  )}
                />
              </div>
            </section>

            {/* Password */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faLock} className="text-slate-400 text-sm" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  {t('completeOnboarding.passwordSection')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      type="password"
                      label={t('onboarding.admin.password')}
                      placeholder={t('onboarding.admin.passwordPlaceholder')}
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
                      type="password"
                      label={t('onboarding.admin.confirmPassword')}
                      placeholder={t('onboarding.admin.confirmPasswordPlaceholder')}
                      required
                      errorMessage={errors?.confirmPassword?.message}
                    />
                  )}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {t('onboarding.admin.passwordHint')}
              </p>
            </section>

            {/* Organization Details (optional) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faPhone} className="text-slate-400 text-sm" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  {t('completeOnboarding.orgSection')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {t('completeOnboarding.orgSectionHint')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="orgAddress"
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
                  name="orgDescription"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t('completeOnboarding.orgDescription')}
                      placeholder={t('completeOnboarding.orgDescriptionPlaceholder')}
                    />
                  )}
                />
              </div>
            </section>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                type="submit"
                primary
                className="w-full !py-3 !text-sm"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('completeOnboarding.submit')}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CompleteOnboarding;
