import { motion, Variants } from 'framer-motion';
import { RoleTypes } from '@/types/auth.type';
import { useI18n } from '@/i18n/i18n';
import { InternalPageHeader } from '@/components/layout/InternalPage';

interface DashboardHeaderProps {
  userName?: string | null;
  role?: RoleTypes;
  variants?: Variants;
}

const DashboardHeader = ({
  userName,
  role,
  variants,
}: DashboardHeaderProps) => {
  const { t } = useI18n();

  return (
    <motion.header
      className="w-full"
      variants={variants}
    >
      <InternalPageHeader
        eyebrow="Overview"
        title={
          userName
            ? t('dashboard.welcome', { name: userName })
            : t('dashboard.welcomeDefault')
        }
        description={
          role === RoleTypes.ADMIN || role === RoleTypes.STAFF
            ? t('dashboard.platformOverview')
            : role === RoleTypes.RIDER
              ? 'Your delivery performance at a glance'
              : role === RoleTypes.BUSINESS
                ? "Your organization's delivery operations"
                : 'Track your deliveries'
        }
      />
    </motion.header>
  );
};

export default DashboardHeader;
