import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import Button from '@/components/inputs/Button';
import { useSubmitContactInquiryMutation } from '@/api/mutations/organization.mutations';
import { useI18n } from '@/i18n/i18n';
import type { ContactInquiryPayload } from '@/types/organization.type';
import { validateRwandanPhoneNumber } from '@/utils/phone.util';

interface ContactUsFormProps {
  className?: string;
  onSuccessAction?: () => void;
  successActionLabel?: string;
  hideIntro?: boolean;
}

const ContactUsForm = ({
  className,
  onSuccessAction,
  successActionLabel,
  hideIntro = false,
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
          <div className="w-16 h-16 rounded-full bg-[--surface] flex items-center justify-center">
            <FontAwesomeIcon icon={faCheck} className="text-[--ink] text-2xl" />
          </div>
          <h3 className="text-xl font-medium text-foreground">
            {t('contact.successTitle')}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {t('contact.successMessage')}
          </p>
          <Button
            primary
            className="mt-2 rounded-[--radius-control] font-medium"
            onClick={handleSuccessAction}
          >
            {successActionLabel ?? t('contact.close')}
          </Button>
        </motion.div>
      ) : (
        <>
          {!hideIntro ? (
            <div className="flex items-center gap-3 mb-1">
              <span className="w-10 h-10 rounded-[--radius-control] bg-[var(--surface)] flex items-center justify-center border border-border">
                <FontAwesomeIcon icon={faBuilding} className="text-foreground" />
              </span>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  {t('contact.title')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('contact.subtitle')}
                </p>
              </div>
            </div>
          ) : null}

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
                rules={{
                  validate: (value) => validateRwandanPhoneNumber(value, false),
                }}
                render={({ field }) => (
                  <TelInput
                    {...field}
                    label={t('contact.phoneLabel')}
                    placeholder={t('contact.phonePlaceholder')}
                    errorMessage={errors.phoneNumber?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t('contact.messageLabel')}
                  </label>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder={t('contact.messagePlaceholder')}
                    className="w-full rounded-[--radius-control] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              )}
            />

            <Button
              type="submit"
              primary
              className="w-full mt-1 rounded-[--radius-control] font-medium"
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
