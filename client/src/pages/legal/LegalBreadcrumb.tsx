import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';

type LegalBreadcrumbProps = {
  /** Policy pages link back to the legal hub; the hub links back to home. */
  parent?: 'home' | 'legal';
};

const backLinkClassName =
  'type-body-sm inline-flex items-center gap-2 rounded-(--radius-control) bg-(--surface) p-2 px-4 text-(--ink) transition-[background-color,color] duration-200 ease-(--ease-flat) hover:bg-(--surface-hover)';

const LegalBreadcrumb = ({ parent = 'home' }: LegalBreadcrumbProps) => {
  const { t } = useI18n();
  const backTo = parent === 'legal' ? '/legal' : '/';
  const backLabel =
    parent === 'legal'
      ? t('footer.legalOverview')
      : t('legal.breadcrumb.home');

  return (
    <nav aria-label={t('legal.breadcrumb.navLabel')}>
      <Link to={backTo} className={backLinkClassName}>
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" aria-hidden="true" />
        {backLabel}
      </Link>
    </nav>
  );
};

export default LegalBreadcrumb;
