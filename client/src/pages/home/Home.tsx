import { Controller, useForm, type FieldValues } from 'react-hook-form';
import Input from '../../components/inputs/Input';
import { useCreatePublicOrder } from '../../hooks/orders/orders.hooks';
import Button from '@/components/inputs/Button';
import { useEffect, useRef, useState, Suspense } from 'react';
import { formatPhone } from '@/utils/strings.util';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faClock,
  faMapLocationDot,
  faArrowRight,
  faQuoteLeft,
  faChevronLeft,
  faChevronRight,
  faBicycle,
  faBuilding,
  faChartLine,
  faHandshake,
  faRocket,
  faBoxesStacked,
  faUserTie,
  faStore,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useI18n } from '@/i18n/i18n';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import HeroScene from '@/components/three/HeroScene';

const Home = () => {
  const { data: landingStats } = useGetLandingStatsQuery();
  const { t } = useI18n();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const formRef = useRef<HTMLFormElement>(null);

  const { control, handleSubmit } = useForm();
  const { createPublicOrder, isLoading } = useCreatePublicOrder();

  const onSubmit = handleSubmit((data: FieldValues) => {
    createPublicOrder({
      senderPhoneNumber: formatPhone(data?.senderPhoneNumber),
      recipientPhoneNumber: formatPhone(data?.recipientPhoneNumber),
    });
  });

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const features = [
    {
      icon: faBicycle,
      title: t('home.features.fastDelivery.title'),
      description: t('home.features.fastDelivery.desc'),
    },
    {
      icon: faShieldHalved,
      title: t('home.features.secure.title'),
      description: t('home.features.secure.desc'),
    },
    {
      icon: faClock,
      title: t('home.features.tracking.title'),
      description: t('home.features.tracking.desc'),
    },
    {
      icon: faMapLocationDot,
      title: t('home.features.coverage.title'),
      description: t('home.features.coverage.desc'),
    },
  ];

  const businessFeatures = [
    {
      icon: faChartLine,
      title: t('home.b2b.analytics.title'),
      description: t('home.b2b.analytics.desc'),
    },
    {
      icon: faBoxesStacked,
      title: t('home.b2b.bulk.title'),
      description: t('home.b2b.bulk.desc'),
    },
    {
      icon: faHandshake,
      title: t('home.b2b.support.title'),
      description: t('home.b2b.support.desc'),
    },
    {
      icon: faBuilding,
      title: t('home.b2b.plans.title'),
      description: t('home.b2b.plans.desc'),
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.desc'),
      icon: faRocket,
    },
    {
      step: '02',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.desc'),
      icon: faBicycle,
    },
    {
      step: '03',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.desc'),
      icon: faCheck,
    },
  ];

  const testimonials = [
    {
      name: t('home.testimonials.t1.name'),
      role: t('home.testimonials.t1.role'),
      content: t('home.testimonials.t1.content'),
      type: 'business',
    },
    {
      name: t('home.testimonials.t2.name'),
      role: t('home.testimonials.t2.role'),
      content: t('home.testimonials.t2.content'),
      type: 'business',
    },
    {
      name: t('home.testimonials.t3.name'),
      role: t('home.testimonials.t3.role'),
      content: t('home.testimonials.t3.content'),
      type: 'personal',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const floatAnimation = {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <main className="min-h-screen w-full bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Three.js Background */}
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        {/* Subtle background pattern */}
        <figure
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        <article className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 pt-8 pb-16 lg:pt-12 lg:pb-20">
          <motion.section
            className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-center min-h-[calc(100vh-6rem)]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Content */}
            <motion.header
              className="w-full lg:w-[45%] flex flex-col gap-6 order-2 lg:order-1"
              variants={itemVariants as unknown as Variants}
            >
              {/* Customer type tabs */}
              <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit" role="tablist">
                <button
                  onClick={() => setActiveTab('personal')}
                  role="tab"
                  aria-selected={activeTab === 'personal'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-normal transition-all duration-200 cursor-pointer ${
                    activeTab === 'personal'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faStore} className="text-xs" />
                  {t('home.hero.tab.personal')}
                </button>
                <button
                  onClick={() => setActiveTab('business')}
                  role="tab"
                  aria-selected={activeTab === 'business'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-normal transition-all duration-200 cursor-pointer ${
                    activeTab === 'business'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faUserTie} className="text-xs" />
                  {t('home.hero.tab.business')}
                </button>
              </nav>

              {/* Dynamic headline */}
              <AnimatePresence mode="wait">
                <motion.hgroup
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-slate-900">
                    {activeTab === 'personal' ? t('home.hero.title1') : t('home.b2b.title1')}
                    <br />
                    <span className="text-primary-700">
                      {activeTab === 'personal' ? t('home.hero.title2') : t('home.b2b.title2')}
                    </span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                    {activeTab === 'personal'
                      ? t('home.hero.subtitle')
                      : t('home.b2b.subtitle')}
                  </p>
                </motion.hgroup>
              </AnimatePresence>

              {/* Trust indicators */}
              <motion.figure
                className="flex items-center gap-6 pt-4"
                variants={itemVariants as unknown as Variants}
              >
                <figcaption className="flex -space-x-3" aria-label="Customer avatars">
                  {['JM', 'AK', 'MP', 'CN'].map((initials, i) => (
                    <span
                      key={i}
                      className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-normal text-slate-600"
                    >
                      {initials}
                    </span>
                  ))}
                </figcaption>
                <address className="not-italic flex flex-col">
                  <strong className="text-sm font-semibold text-slate-900">
                    {typeof landingStats?.activeCustomers === 'number'
                      ? `${landingStats.activeCustomers.toLocaleString()}+ customers`
                      : 'Growing community'}
                  </strong>
                  <span className="text-xs text-slate-500 font-normal">Trust Peekaboo daily</span>
                </address>
              </motion.figure>

              {/* Business stats */}
              <AnimatePresence mode="wait">
                {activeTab === 'business' && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-3 gap-4 pt-4"
                  >
                    {[
                      { value: '98%', label: 'On-time' },
                      { value: '500+', label: 'Daily runs' },
                      { value: '24/7', label: 'Support' },
                    ].map((stat, i) => (
                      <li key={i} className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <data className="block text-xl font-bold text-slate-900">{stat.value}</data>
                        <span className="text-xs text-slate-500">{stat.label}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              {/* Business CTA */}
              <AnimatePresence mode="wait">
                {activeTab === 'business' && (
                  <motion.nav
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    <Link
                      to="/auth/register"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg text-sm font-normal hover:bg-slate-800 transition-colors"
                    >
                      <FontAwesomeIcon icon={faBuilding} />
                      {t('home.b2b.cta.account')}
                    </Link>
                    <button
                      onClick={scrollToForm}
                      className="inline-flex items-center gap-2 px-6 py-3 text-slate-700 hover:text-slate-900 text-sm font-normal transition-colors cursor-pointer"
                    >
                      {t('home.hero.tryQuickDelivery')}
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </button>
                  </motion.nav>
                )}
              </AnimatePresence>
            </motion.header>

            {/* Right - Form */}
            <motion.aside
              className="w-full lg:w-[55%] flex justify-center lg:justify-end order-1 lg:order-2"
              variants={itemVariants as unknown as Variants}
            >
              <motion.article
                className="relative w-full max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <form
                  ref={formRef}
                  onSubmit={onSubmit}
                  className="relative bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-8 sm:p-10 border border-slate-200"
                >
                  <header className="space-y-2 mb-8">
                    <figure className="flex items-center gap-3">
                      <mark className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                        <img src="/peekaboo.png" alt="Peekaboo" className="w-7 h-7 object-contain brightness-0 invert" />
                      </mark>
                      <hgroup>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {t('home.form.title')}
                        </h2>
                        <p className="text-slate-500 text-sm font-normal">
                          {t('home.hero.quickStart')}
                        </p>
                      </hgroup>
                    </figure>
                  </header>

                  <fieldset className="space-y-5 mb-8">
                    <Controller
                      name="senderPhoneNumber"
                      control={control}
                      render={({ field }) => (
                        <label className="block space-y-2">
                          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <mark className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-normal">1</mark>
                            {t('home.form.senderLabel')}
                          </span>
                          <Input
                            {...field}
                            placeholder={t('home.form.senderPlaceholder')}
                            className="!rounded-lg !border-slate-200 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900/10 !bg-slate-50 hover:!bg-white transition-all !py-3.5"
                          />
                        </label>
                      )}
                    />
                    <Controller
                      name="recipientPhoneNumber"
                      control={control}
                      render={({ field }) => (
                        <label className="block space-y-2">
                          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <mark className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-normal">2</mark>
                            {t('home.form.recipientLabel')}
                          </span>
                          <Input
                            {...field}
                            placeholder={t('home.form.recipientPlaceholder')}
                            className="!rounded-lg !border-slate-200 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900/10 !bg-slate-50 hover:!bg-white transition-all !py-3.5"
                          />
                        </label>
                      )}
                    />
                  </fieldset>

                  <footer className="space-y-4">
                    <Button
                      className="w-full !bg-slate-900 hover:!bg-slate-800 !py-4 !rounded-lg !text-base !font-normal transition-all duration-200 cursor-pointer !border-0"
                      isLoading={isLoading}
                      type="submit"
                      primary
                    >
                      {t('home.form.continue')}
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </Button>

                    <nav className="flex items-center justify-center gap-3 pt-2">
                      <span className="text-slate-400 text-sm font-normal">{t('home.hero.haveOrder')}</span>
                      <Link
                        to="/track"
                        className="text-slate-900 hover:text-slate-700 text-sm font-normal transition-colors"
                      >
                        {t('home.hero.trackHere')} &rarr;
                      </Link>
                    </nav>
                  </footer>

                  <aside className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500 font-normal">
                    <span className="flex items-center gap-1.5 text-[12px]">
                      <FontAwesomeIcon size='xs' icon={faShieldHalved} className="text-slate-400 text-[12px]" />
                      {t('home.hero.verifiedRiders')}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true" />
                    <span className="flex items-center gap-1.5 text-[12px]">
                      <FontAwesomeIcon size='xs' icon={faClock} className="text-slate-400 text-[12px]" />
                      {t('home.hero.realtimeTracking')}
                    </span>
                  </aside>
                </form>
              </motion.article>
            </motion.aside>
          </motion.section>
        </article>

        {/* Scroll indicator */}
        <motion.figure
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          aria-label="Scroll down"
        >
          <motion.span
            className="w-5 h-9 rounded-full border-2 border-slate-300 flex justify-center pt-2"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.span
              className="block w-1 h-1.5 rounded-full bg-slate-400"
              animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.span>
        </motion.figure>
      </section>

      {/* Trusted By Section */}
      <section className="w-full py-12 border-y border-slate-100">
        <article className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <motion.figure 
            className="flex flex-col md:flex-row items-center justify-between gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.figcaption 
              className="text-sm text-slate-500 font-medium uppercase tracking-wider"
              variants={fadeInUp as unknown as Variants}
            >
              {t('home.b2b.trustedBy')}
            </motion.figcaption>
            <ul className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
              {['E-Commerce', 'Restaurants', 'Pharmacies', 'Retail Stores', 'Florists'].map((industry, i) => (
                <motion.li
                  key={industry}
                  className="text-slate-400 font-normal text-sm uppercase tracking-wide hover:text-primary-600 transition-colors cursor-default"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ scale: 1.1, color: '#5f9598' }}
                >
                  {industry}
                </motion.li>
              ))}
            </ul>
          </motion.figure>
        </article>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 lg:py-28">
        <motion.article
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header className="text-center mb-14 lg:mb-16" variants={fadeInUp as unknown as Variants}>
            <motion.span 
              className="inline-block text-primary-600 font-medium text-sm tracking-wider uppercase mb-3"
              whileInView={{ opacity: [0, 1], y: [20, 0] }}
              viewport={{ once: true }}
            >
              Why Choose Us
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal">
              {t('home.features.subtitle')}
            </p>
          </motion.header>

          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.li
                key={index}
                variants={scaleIn as unknown as Variants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 400, damping: 17 }
                }}
              >
                <article className="group h-full rounded-2xl p-7 border border-slate-200 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500">
                  <motion.figure 
                    className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FontAwesomeIcon icon={feature.icon} className="text-primary-600 text-xl" />
                  </motion.figure>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </article>
              </motion.li>
            ))}
          </motion.ul>
        </motion.article>
      </section>

      {/* Business Solutions Section */}
      <section className="w-full py-20 lg:py-28 border-y border-slate-100">
        <motion.article
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <figure className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.figcaption variants={slideInLeft as unknown as Variants}>
              <motion.span 
                className="inline-block text-primary-600 font-medium text-sm tracking-wider uppercase mb-4"
                whileInView={{ opacity: [0, 1], x: [-20, 0] }}
                viewport={{ once: true }}
              >
                {t('home.b2b.badge')}
              </motion.span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                {t('home.b2b.title1')}
                <br />
                <span className="text-primary-600">
                  {t('home.b2b.title2')}
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-normal">
                {t('home.b2b.subtitle')}
              </p>

              <ul className="space-y-4 mb-10">
                {businessFeatures.map((feature, i) => (
                  <motion.li
                    key={i}
                    className="group flex items-start gap-4"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    whileHover={{ x: 8 }}
                  >
                    <motion.mark 
                      className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <FontAwesomeIcon icon={feature.icon} className="text-primary-600" />
                    </motion.mark>
                    <section>
                      <h4 className="text-slate-900 font-semibold mb-1 group-hover:text-primary-700 transition-colors">{feature.title}</h4>
                      <p className="text-slate-500 text-sm font-normal">{feature.description}</p>
                    </section>
                  </motion.li>
                ))}
              </ul>

              <motion.nav 
                className="flex flex-wrap gap-4"
                variants={fadeInUp as unknown as Variants}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-normal hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/25"
                  >
                    {t('home.b2b.cta.trial')}
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </motion.span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-700 rounded-xl font-normal transition-all"
                  >
                    {t('home.b2b.cta.sales')}
                  </Link>
                </motion.div>
              </motion.nav>
            </motion.figcaption>

            <motion.aside
              className="relative"
              variants={slideInRight as unknown as Variants}
            >
              <motion.article 
                className="rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-900/5"
                animate={floatAnimation}
              >
                <ul className="grid grid-cols-2 gap-6">
                  {[
                    { value: '10K+', label: t('home.b2b.stats.packages'), icon: faBoxesStacked },
                    { value: '50+', label: t('home.b2b.stats.partners'), icon: faBuilding },
                    { value: '99.2%', label: t('home.b2b.stats.success'), icon: faCheck },
                    { value: '4.9/5', label: t('home.b2b.stats.rating'), icon: faHandshake },
                  ].map((stat, i) => (
                    <motion.li
                      key={i}
                      className="group text-center p-4 rounded-xl hover:bg-primary-50 transition-colors cursor-default"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                      whileHover={{ scale: 1.08 }}
                    >
                      <motion.figure 
                        className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors"
                        whileHover={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <FontAwesomeIcon icon={stat.icon} className="text-primary-600" />
                      </motion.figure>
                      <motion.data 
                        className="block text-2xl font-bold text-slate-900 mb-1"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                      >
                        {stat.value}
                      </motion.data>
                      <span className="text-xs text-slate-500 font-normal">{stat.label}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.article>
            </motion.aside>
          </figure>
        </motion.article>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 lg:py-28">
        <motion.article
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header className="text-center mb-14 lg:mb-16" variants={fadeInUp as unknown as Variants}>
            <motion.span 
              className="inline-block text-primary-600 font-medium text-sm tracking-wider uppercase mb-3"
              animate={pulseAnimation}
            >
              Simple Process
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal">
              {t('home.howItWorks.subtitle')}
            </p>
          </motion.header>

          <motion.ol
            className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            variants={containerVariants}
          >
            {/* Animated connection line */}
            <motion.hr 
              className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 border-0 origin-left" 
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />

            {howItWorks.map((step, index) => (
              <motion.li
                key={index}
                className="relative text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <motion.figure 
                  className="relative inline-flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.mark 
                    className="relative w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-primary-500/15 border border-primary-100"
                    whileHover={{ 
                      boxShadow: '0 20px 40px -10px rgba(95, 149, 152, 0.3)',
                      borderColor: '#5f9598'
                    }}
                  >
                    <FontAwesomeIcon icon={step.icon} className="text-2xl text-primary-600" />
                  </motion.mark>
                  <motion.data 
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-medium flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: 'spring', stiffness: 500 }}
                  >
                    {step.step}
                  </motion.data>
                </motion.figure>

                <motion.h3 
                  className="text-xl font-bold text-slate-900 mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.2 }}
                >
                  {step.title}
                </motion.h3>
                <motion.p 
                  className="text-slate-600 max-w-xs mx-auto font-normal"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  {step.description}
                </motion.p>
              </motion.li>
            ))}
          </motion.ol>
        </motion.article>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 lg:py-28 border-t border-slate-100">
        <motion.article
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header className="text-center mb-12" variants={fadeInUp as unknown as Variants}>
            <motion.span 
              className="inline-block text-primary-600 font-medium text-sm tracking-wider uppercase mb-3"
              whileInView={{ opacity: [0, 1], scale: [0.8, 1] }}
              viewport={{ once: true }}
            >
              Testimonials
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal">
              {t('home.testimonials.subtitle')}
            </p>
          </motion.header>

          <motion.figure 
            className="relative max-w-4xl mx-auto" 
            variants={scaleIn as unknown as Variants}
          >
            <motion.blockquote 
              className="rounded-2xl p-8 sm:p-12 lg:p-14 border border-slate-200 shadow-lg shadow-slate-900/5"
              whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <FontAwesomeIcon
                  icon={faQuoteLeft}
                  className="absolute top-6 left-6 text-5xl text-primary-100"
                  aria-hidden="true"
                />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.section
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10"
                >
                  <p className="text-xl sm:text-2xl text-slate-700 font-normal leading-relaxed mb-8">
                    "{testimonials[activeTestimonial].content}"
                  </p>

                  <figcaption className="flex items-center gap-4">
                    <motion.mark 
                      className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <span className="text-xl font-medium text-white">
                        {testimonials[activeTestimonial].name.charAt(0)}
                      </span>
                    </motion.mark>
                    <cite className="not-italic">
                      <strong className="block text-lg font-semibold text-slate-900">
                        {testimonials[activeTestimonial].name}
                      </strong>
                      <span className="flex items-center gap-2 text-slate-500 font-normal">
                        <FontAwesomeIcon
                          icon={testimonials[activeTestimonial].type === 'business' ? faBuilding : faStore}
                          className="text-xs text-primary-500"
                        />
                        {testimonials[activeTestimonial].role}
                      </span>
                    </cite>
                  </figcaption>
                </motion.section>
              </AnimatePresence>

              <nav className="flex items-center justify-center gap-2.5 mt-8" aria-label="Testimonial navigation">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      index === activeTestimonial
                        ? 'bg-primary-600 w-8'
                        : 'bg-slate-200 hover:bg-primary-300 w-2'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                    aria-current={index === activeTestimonial ? 'true' : undefined}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </nav>
            </motion.blockquote>

            <nav className="flex justify-between absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <motion.button
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="pointer-events-auto -translate-x-4 lg:-translate-x-14 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-primary-600 transition-all cursor-pointer border border-slate-200"
                aria-label="Previous testimonial"
                whileHover={{ scale: 1.15, x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </motion.button>
              <motion.button
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="pointer-events-auto translate-x-4 lg:translate-x-14 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-primary-600 transition-all cursor-pointer border border-slate-200"
                aria-label="Next testimonial"
                whileHover={{ scale: 1.15, x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </motion.button>
            </nav>
          </motion.figure>
        </motion.article>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 lg:py-28 border-t border-slate-100">
        <motion.article
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header
            className="max-w-3xl mx-auto text-center"
            variants={fadeInUp as unknown as Variants}
          >
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
              whileInView={{ 
                opacity: [0, 1],
                y: [30, 0]
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {t('home.cta.title')}
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-normal"
              whileInView={{ opacity: [0, 1] }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {t('home.cta.subtitle')}
            </motion.p>

            <nav className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                onClick={scrollToForm}
                className="group inline-flex items-center gap-3 bg-primary-600 text-white px-10 py-5 rounded-xl text-lg font-normal hover:bg-primary-700 transition-colors cursor-pointer shadow-xl shadow-primary-500/25"
                whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(95, 149, 152, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                {t('home.cta.button')}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </motion.span>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-2 px-8 py-5 text-slate-700 hover:text-primary-700 text-lg font-normal transition-colors border-2 border-slate-200 hover:border-primary-300 rounded-xl"
                >
                  <FontAwesomeIcon icon={faBuilding} />
                  {t('home.b2b.cta.account')}
                </Link>
              </motion.div>
            </nav>
          </motion.header>
        </motion.article>
      </section>
    </main>
  );
};

export default Home;
