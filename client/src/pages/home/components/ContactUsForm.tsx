import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { useSubmitContactInquiryMutation } from '@/api/mutations/organization.mutations';
import { useI18n } from '@/i18n/i18n';
import type { ContactInquiryPayload } from '@/types/organization.type';

interface ContactUsFormProps {
  className?: string;
  onSuccessAction?: () => void;
  successActionLabel?: string;
}

const ContactUsForm = ({
  className,
  onSuccessAction,
  successActionLabel,
}: ContactUsFormProps) => {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [submitInquiry, { isLoading }] = useSubmitContactInquiryMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInquiryPayload>({
    defaultValues: {
      contactName: '',
      contactEmail: '',
      companyName: '',
      phoneNumber: '',
      message: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await submitInquiry(data).unwrap();
      setSubmitted(true);
    } catch {
      // Error is handled by RTK Query
    }
  });

  const handleSuccessAction = () => {
    setSubmitted(false);
    reset();
    onSuccessAction?.();
  };

  return (
    <div className={['flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      {submitted ? (
        <motion.div
          className="flex flex-col items-center gap-4 py-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faCheck} className="text-green-600 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            {t('contact.successTitle')}
          </h3>
          <p className="text-slate-600 text-sm max-w-sm">
            {t('contact.successMessage')}
          </p>
          <Button
            primary
            className="mt-2"
            onClick={handleSuccessAction}
          >
            {successActionLabel ?? t('contact.close')}
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100">
              <FontAwesomeIcon icon={faBuilding} className="text-primary-600" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('contact.title')}
              </h2>
              <p className="text-sm text-slate-600">
                {t('contact.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="contactName"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('contact.nameLabel')}
                    placeholder={t('contact.namePlaceholder')}
                    required
                    errorMessage={errors?.contactName?.message}
                  />
                )}
              />
              <Controller
                name="contactEmail"
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
                    label={t('contact.emailLabel')}
                    placeholder={t('contact.emailPlaceholder')}
                    type="email"
                    required
                    errorMessage={errors?.contactEmail?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="companyName"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('contact.companyLabel')}
                    placeholder={t('contact.companyPlaceholder')}
                    required
                    errorMessage={errors?.companyName?.message}
                  />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t('contact.phoneLabel')}
                    placeholder={t('contact.phonePlaceholder')}
                  />
                )}
              />
            </div>

            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {t('contact.messageLabel')}
                  </label>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder={t('contact.messagePlaceholder')}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              )}
            />

            <Button
              type="submit"
              primary
              className="w-full mt-1"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? t('contact.sending') : (
                <>
                  {t('contact.submit')}
                  <FontAwesomeIcon icon={faPaperPlane} className="ml-2 text-xs" />
                </>
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default ContactUsForm;
