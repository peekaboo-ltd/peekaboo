import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { useEffect } from 'react';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faArrowRight,
  faCheck,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';
import { useAppSelector, useAppDispatch } from '@/states/hooks';
import { setTeamMembers } from '@/states/slices/onboarding.slice';
import { useCreateOrganization } from '@/hooks/organization/organization.hooks';
import type {
  TeamMemberFormData,
  CreateOrganizationPayload,
} from '@/types/organization.type';

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

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 },
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

interface TeamMembersFormData {
  members: TeamMemberFormData[];
}

const UserManagementOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { organization, admin, teamMembers } = useAppSelector(
    (state) => state.onboarding
  );
  const { t } = useI18n();
  const { createOrganization, isLoading } = useCreateOrganization();

  // Redirect if previous steps not completed
  useEffect(() => {
    if (!organization.name) {
      navigate('/onboarding/organization');
    } else if (!admin.phoneNumber) {
      navigate('/onboarding/admin');
    }
  }, [organization, admin, navigate]);

  const { control, handleSubmit } = useForm<TeamMembersFormData>({
    defaultValues: {
      members: teamMembers,
    },
  });

  const handleFinish = handleSubmit((data) => {
    // Save team members to Redux (for future use)
    dispatch(setTeamMembers(data.members));

    // Build the API payload
    const payload: CreateOrganizationPayload = {
      organization: {
        name: organization.name,
        email: organization.email || undefined,
        phoneNumber: organization.phoneNumber || undefined,
        address: organization.address || undefined,
        description: [organization.industry, organization.deliveryVolume]
          .filter(Boolean)
          .join(' - ') || undefined,
      },
      adminUser: {
        name: admin.name || undefined,
        email: admin.email || undefined,
        phoneNumber: admin.phoneNumber,
        password: admin.password || undefined,
      },
    };

    // Call the API
    createOrganization(payload);
  });

  return (
    <motion.main
      className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <article className="max-w-5xl mx-auto flex flex-col gap-8">
        <motion.div variants={itemVariants}>
          <StepProgress currentStep={3} />
        </motion.div>

        <motion.header variants={itemVariants} className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-primary-600">
            {t('onboarding.step', { step: 3 })}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t('onboarding.users.title')}
          </h1>
          <p className="text-slate-600 max-w-3xl">
            {t('onboarding.users.subtitle')}
          </p>
        </motion.header>

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <motion.form
            variants={cardVariants}
            onSubmit={handleFinish}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 space-y-6"
          >
            <section className="flex items-center gap-3 text-slate-800">
              <motion.span
                className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <FontAwesomeIcon icon={faUsers} className="text-primary-600" />
              </motion.span>
              <div>
                <h2 className="text-lg font-semibold">
                  {t('onboarding.users.detailsTitle')}
                </h2>
                <p className="text-sm text-slate-500">
                  {t('onboarding.users.detailsSubtitle')}
                </p>
              </div>
            </section>

            <div className="space-y-4">
              {[0, 1].map((index) => (
                <motion.div
                  key={`member-${index}`}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Controller
                    name={`members.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('onboarding.users.memberName', {
                          index: index + 1,
                        })}
                        placeholder={t('onboarding.users.memberNamePlaceholder')}
                      />
                    )}
                  />
                  <Controller
                    name={`members.${index}.email`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('onboarding.users.memberEmail', {
                          index: index + 1,
                        })}
                        placeholder={t('onboarding.users.memberEmailPlaceholder')}
                        type="email"
                      />
                    )}
                  />
                </motion.div>
              ))}
            </div>

            <aside className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              {t('onboarding.users.optionalHint')}
            </aside>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <Link
                to="/onboarding/admin"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {t('onboarding.users.back')}
              </Link>
              <Button
                type="submit"
                primary
                className="px-6"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  t('onboarding.users.creating')
                ) : (
                  <>
                    {t('onboarding.users.finish')}
                    <FontAwesomeIcon
                      icon={faRocket}
                      className="ml-2 text-xs"
                    />
                  </>
                )}
              </Button>
            </footer>
          </motion.form>

          <motion.aside
            variants={sidebarVariants}
            className="bg-gradient-to-br from-primary-900 to-primary-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl"
          >
            <header>
              <h3 className="text-xl font-semibold">
                {t('onboarding.users.nextTitle')}
              </h3>
              <p className="text-sm text-primary-100 mt-2">
                {t('onboarding.users.nextSubtitle')}
              </p>
            </header>

            <ul className="space-y-4 text-sm text-primary-100">
              {[
                t('onboarding.users.nextItem1'),
                t('onboarding.users.nextItem2'),
                t('onboarding.users.nextItem3'),
              ].map((item, index) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-xs text-primary-200"
                    />
                  </span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="mt-auto pt-4 border-t border-primary-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-primary-200 mb-3">
                {t('onboarding.users.alreadyHaveAccount')}
              </p>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors w-full border border-white/20"
              >
                {t('onboarding.users.signIn')}
              </Link>
            </motion.div>
          </motion.aside>
        </section>
      </article>
    </motion.main>
  );
};

export default UserManagementOnboarding;
