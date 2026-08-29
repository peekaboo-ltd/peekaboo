import { useI18n } from '@/i18n/i18n';
import SEO, { SEOProps } from './SEO';

type LocalizedSEOProps = Omit<SEOProps, 'title' | 'description'> & {
  seoKey: string;
};

const LocalizedSEO = ({ seoKey, keywords, ...rest }: LocalizedSEOProps) => {
  const { t } = useI18n();
  return (
    <SEO
      title={t(`seo.${seoKey}.title`)}
      description={t(`seo.${seoKey}.description`)}
      keywords={keywords}
      {...rest}
    />
  );
};

export default LocalizedSEO;
