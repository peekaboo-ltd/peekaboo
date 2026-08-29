import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useResetPasswordMutation } from '@/api/mutations/auth.mutations';
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

const ResetPassword = () => {
  const { t } = useI18n();
  useDocumentTitle(t('auth.reset.docTitle'));
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t('auth.passwordMin'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword }).unwrap();
      toast.success(response?.message || t('auth.reset.successToast'));
      setIsSubmitted(true);
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          t('auth.reset.error')
      );
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')}>
        {!token ? (
          <AuthNotice tone="error">
            {t('auth.reset.invalidToken')}
          </AuthNotice>
        ) : isSubmitted ? (
          <AuthNotice tone="success">
            {t('auth.reset.success')}
          </AuthNotice>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Input
              label={t('auth.reset.newPassword')}
              type="password"
              placeholder={t('auth.reset.minimumPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              showPasswordToggle
              className={authInputClassName}
            />
            <Input
              label={t('auth.reset.confirmNewPassword')}
              type="password"
              placeholder={t('auth.reset.reenterPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              showPasswordToggle
              className={authInputClassName}
            />
            <Button
              type="submit"
              primary
              className={authPrimaryButtonClassName}
              isLoading={isLoading}
            >
              {t('auth.reset.submit')}
            </Button>
          </form>
        )}

        <AuthFooterNote>
          <AuthLink to="/auth/login">{t('auth.reset.return')}</AuthLink>
        </AuthFooterNote>
      </AuthCard>
    </AuthPageShell>
  );
};

export default ResetPassword;
