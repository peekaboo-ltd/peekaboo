import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useForgotPasswordMutation } from '@/api/mutations/auth.mutations';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  AuthCard,
  AuthFooterNote,
  AuthLink,
  AuthNotice,
  AuthPageShell,
  authInputClassName,
  authPrimaryButtonClassName,
} from './AuthPageShell';
import { useI18n } from '@/i18n/i18n';

const ForgotPassword = () => {
  const { t } = useI18n();
  useDocumentTitle(t('auth.forgot.docTitle'));
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await forgotPassword({ identifier }).unwrap();
      toast.success(response?.message || t('auth.forgot.sent'));
      setIsSubmitted(true);
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          t('auth.forgot.error')
      );
    }
  };

  return (
    <AuthPageShell>
      <AuthCard
        title={t('auth.forgot.title')}
        subtitle={t('auth.forgot.subtitle')}
      >
        {isSubmitted ? (
          <AuthNotice tone="success">
            {t('auth.forgot.success')}
          </AuthNotice>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Input
              label={t('auth.emailOrPhone')}
              placeholder={t('auth.forgot.placeholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className={authInputClassName}
            />
            <Button
              type="submit"
              primary
              className={authPrimaryButtonClassName}
              isLoading={isLoading}
            >
              {t('auth.forgot.submit')}
            </Button>
          </form>
        )}

        <AuthFooterNote>
          {t('auth.forgot.remembered')}{' '}
          <AuthLink to="/auth/login">{t('auth.forgot.back')}</AuthLink>
        </AuthFooterNote>
      </AuthCard>
    </AuthPageShell>
  );
};

export default ForgotPassword;
