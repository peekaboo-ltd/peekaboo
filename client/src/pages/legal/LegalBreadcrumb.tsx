import CustomBreadcrumb from '@/components/inputs/CustomBreadcrumb';
import { useI18n } from '@/i18n/i18n';

export type LegalBreadcrumbLeaf = {
  labelKey: string;
  path: string;
};

type LegalBreadcrumbProps = {
  /** When set, adds the current policy page as the final crumb. Omit on the legal hub. */
  currentPage?: LegalBreadcrumbLeaf;
};

const LegalBreadcrumb = ({ currentPage }: LegalBreadcrumbProps) => {
  const { t } = useI18n();

  const navigationLinks = [
    { route: '/', label: t('legal.breadcrumb.home') },
    { route: '/legal', label: t('footer.legalOverview') },
    ...(currentPage
      ? [{ route: currentPage.path, label: t(currentPage.labelKey) }]
      : []),
  ];

  return (
    <nav aria-label={t('legal.breadcrumb.navLabel')} className="w-full">
      <div className="rounded-(--radius-card) border border-(--line) bg-(--paper) px-4 py-3 sm:px-5">
        <CustomBreadcrumb navigationLinks={navigationLinks} />
      </div>
    </nav>
  );
};

export default LegalBreadcrumb;
