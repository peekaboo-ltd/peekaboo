import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import BusinessPlansSection from '@/pages/home/components/BusinessPlansSection';
import { mapApiPlanToCard } from '@/pages/home/home.utils';
import { containerVariants, fadeInUp } from '@/pages/home/home.animations';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Button from '@/components/inputs/Button';
import { useFetchPublicBusinessPlansQuery } from '@/api/queries/businessPlan.queries';

const Services = () => {
  useDocumentTitle('Services');
  const { data, isFetching } = useFetchPublicBusinessPlansQuery(undefined);

  const businessPlans = (data?.data || []).map(mapApiPlanToCard);

  return (
    <main className="relative min-h-screen w-full bg-[#FAFAF7] overflow-x-hidden mt-0 max-lg:mt-16">
      {/* Hero Section */}
      <section className="relative w-full pt-28 pb-20 lg:pt-36 lg:pb-28 bg-primary-900 overflow-hidden">
        {/* Decorative background blobs */}
        <figure
          className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-secondary-200/10 blur-3xl"
          aria-hidden="true"
        />
        <figure
          className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-primary-200/10 blur-3xl"
          aria-hidden="true"
        />

        <motion.article
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.header variants={fadeInUp}>
            <span className="inline-block text-[11px] uppercase text-secondary-400 font-semibold mb-4">
              Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Business Delivery Plans
            </h1>
            <p className="text-[13px] text-primary-300 max-w-3xl mx-auto leading-relaxed">
              Choose the package that matches your growth: monthly, weekly, daily, or a dedicated
              rider fully committed to your operations.
            </p>
          </motion.header>
        </motion.article>
      </section>

      {/* Plans Section */}
      <BusinessPlansSection
        badgeLabel="Business packages"
        title="Business Growth Plans"
        subtitle="Scale your deliveries with flexible monthly, weekly, and daily bundles—or unlock a dedicated rider for high and consistent demand."
        popularLabel="Most popular"
        perMonthLabel="Transparent, predictable pricing for growing teams"
        ctaLabel="Talk to our team"
        detailsCtaLabel="View more details"
        plans={businessPlans}
        isLoading={isFetching}
      />

      {/* CTA Section */}
      <section className="w-full py-20 lg:py-28 bg-primary-900">
        <motion.article
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header variants={fadeInUp}>
            <span className="inline-block text-[11px] uppercase font-medium text-primary-400 mb-6">
              Get started
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Ready to streamline your deliveries?
            </h2>
            <p className="text-[13px] text-primary-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Get in touch with our team to find the perfect plan for your business needs.
            </p>

            <Link to="/contact">
              <Button className="bg-white text-black hover:bg-white/90 hover:!text-black">
                Contact our team
                <FontAwesomeIcon icon={faArrowRight} className="text-[11px] ml-1" />
              </Button>
            </Link>
          </motion.header>
        </motion.article>
      </section>
    </main>
  );
};

export default Services;
