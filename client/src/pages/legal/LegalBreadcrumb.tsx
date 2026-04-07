import { useMemo } from 'react';
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

  const navigationLinks = useMemo(() => {
    const leaf = currentPage;
    return [
      { route: '/', label: t('legal.breadcrumb.home') },
      { route: '/legal', label: t('footer.legalOverview') },
      ...(leaf ? [{ route: leaf.path, label: t(leaf.labelKey) }] : []),
    ];
  }, [t, currentPage?.path, currentPage?.labelKey]);

  return (
    <nav aria-label={t('legal.breadcrumb.navLabel')} className="w-full">
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3 sm:px-5">
        <CustomBreadcrumb navigationLinks={navigationLinks} />
      </div>
    </nav>
  );
};

export default LegalBreadcrumb;
