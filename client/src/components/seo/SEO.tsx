import { Helmet } from 'react-helmet';

export type SEOProps = {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
};

const SITE_NAME = 'Peekaboo';
const DEFAULT_IMAGE = '/peekaboo.png';

const SEO = ({
  title,
  description,
  keywords,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
}: SEOProps) => {
  const hasWindow = typeof window !== 'undefined';
  const origin = hasWindow ? window.location.origin : 'https://peekaboo.app';
  const pathname = hasWindow ? window.location.pathname : '/';
  const canonicalUrl = `${origin}${path || pathname}`;
  const imageUrl = image.startsWith('http') ? image : `${origin}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="application-name" content={SITE_NAME} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEO;
