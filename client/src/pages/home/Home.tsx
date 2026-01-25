import { Controller, useForm, type FieldValues } from 'react-hook-form';
import Input from '../../components/inputs/Input';
import { useCreatePublicOrder } from '../../hooks/orders/orders.hooks';
import Button from '@/components/inputs/Button';
import { useEffect, useRef, useState } from 'react';
import { formatPhone } from '@/utils/strings.util';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faClock,
  faMapLocationDot,
  faArrowRight,
  faPlay,
  faQuoteLeft,
  faChevronLeft,
  faChevronRight,
  faBicycle,
} from '@fortawesome/free-solid-svg-icons';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useI18n } from '@/i18n/i18n';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const Home = () => {
  const { data: landingStats } = useGetLandingStatsQuery();
  const { t } = useI18n();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
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
      gradient: 'from-primary-700 to-primary-900',
    },
    {
      icon: faShieldHalved,
      title: t('home.features.secure.title'),
      description: t('home.features.secure.desc'),
      gradient: 'from-primary-600 to-primary-800',
    },
    {
      icon: faClock,
      title: t('home.features.tracking.title'),
      description: t('home.features.tracking.desc'),
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: faMapLocationDot,
      title: t('home.features.coverage.title'),
      description: t('home.features.coverage.desc'),
      gradient: 'from-primary-800 to-primary-950',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.desc'),
    },
    {
      step: '02',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.desc'),
    },
    {
      step: '03',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.desc'),
    },
  ];

  const testimonials = [
    {
      name: t('home.testimonials.t1.name'),
      role: t('home.testimonials.t1.role'),
      content: t('home.testimonials.t1.content'),
    },
    {
      name: t('home.testimonials.t2.name'),
      role: t('home.testimonials.t2.role'),
      content: t('home.testimonials.t2.content'),
    },
    {
      name: t('home.testimonials.t3.name'),
      role: t('home.testimonials.t3.role'),
      content: t('home.testimonials.t3.content'),
    },
  ];

  // Auto-rotate testimonials
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
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background Pattern - Speed lines inspired by logo */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Speed lines pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.03]">
            <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <g stroke="currentColor" strokeWidth="2" fill="none" className="text-primary-900">
                <path d="M-100 200 Q200 180 400 200 T900 180" />
                <path d="M-100 250 Q200 230 400 250 T900 230" />
                <path d="M-100 300 Q200 280 400 300 T900 280" />
                <path d="M-100 350 Q200 330 400 350 T900 330" />
              </g>
            </svg>
          </div>

          {/* Floating gradient orbs */}
          <motion.div
            className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-primary-200/30 to-primary-400/10 blur-3xl"
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-gradient-to-br from-primary-300/20 to-primary-500/10 blur-3xl"
            animate={{ y: [0, 40, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-primary-100/20 to-primary-300/10 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 pt-8 pb-16 lg:pt-16 lg:pb-24">
          <motion.article
            className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-8rem)]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Content */}
            <motion.section className="w-full flex flex-col gap-8" variants={itemVariants as unknown as Variants}>
              {/* Trust Badge */}
              <motion.div
                className="inline-flex items-center gap-3 w-fit"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <span className="relative flex items-center gap-2 bg-primary-50 border border-primary-200/60 text-primary-800 px-5 py-2.5 rounded-full text-sm font-medium shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-600"></span>
                  </span>
                  {typeof landingStats?.activeCustomers === 'number'
                    ? t('home.hero.badgeWithCount', { count: landingStats.activeCustomers })
                    : t('home.hero.badgeLoading')}
                </span>
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  <span className="text-gray-900">{t('home.hero.title1')}</span>
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 bg-clip-text text-transparent">
                      {t('home.hero.title2')}
                    </span>
                    <motion.span
                      className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-primary-200/60 to-primary-300/40 -skew-x-6 rounded"
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                  {t('home.hero.subtitle')}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  onClick={scrollToForm}
                  className="group relative inline-flex items-center gap-3 bg-primary-900 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-xl shadow-primary-900/25 overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative">{t('home.form.title')}</span>
                  <FontAwesomeIcon icon={faArrowRight} className="relative group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>

                <Link
                  to="/track"
                  className="group inline-flex items-center gap-3 text-gray-700 hover:text-primary-700 px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary-100 transition-colors duration-300">
                    <FontAwesomeIcon icon={faPlay} className="text-sm ml-0.5" />
                  </span>
                  Track Order
                </Link>
              </div>

              {/* Stats Row */}
              <motion.div
                className="flex flex-wrap gap-8 pt-8 border-t border-gray-200/80"
                variants={itemVariants as unknown as Variants}
              >
                {[
                  { value: '500+', label: 'Daily Deliveries' },
                  { value: '98%', label: 'On-Time Rate' },
                  { value: '4.9★', label: 'Customer Rating' },
                ].map((stat, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</span>
                    <span className="text-sm text-gray-500">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.section>

            {/* Right - Form Card */}
            <motion.aside
              className="w-full flex justify-center lg:justify-end"
              variants={itemVariants as unknown as Variants}
            >
              <motion.form
                ref={formRef}
                onSubmit={onSubmit}
                className="relative w-full max-w-md"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Card Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-3xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity" />

                {/* Card */}
                <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-900/10 p-8 sm:p-10 border border-gray-100">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-tr-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-100/40 to-transparent transform rotate-45 translate-x-16 -translate-y-16" />
                  </div>

                  <header className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <img src="/peekaboo.png" alt="Peekaboo" className="w-8 h-8 object-contain" />
                      <h2 className="text-2xl font-bold text-gray-900">
                        {t('home.form.title')}
                      </h2>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {t('home.form.subtitle')}
                    </p>
                  </header>

                  <fieldset className="space-y-5 mb-8">
                    <Controller
                      name="senderPhoneNumber"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            {t('home.form.senderLabel')}
                          </label>
                          <Input
                            {...field}
                            placeholder={t('home.form.senderPlaceholder')}
                            className="!rounded-xl !border-gray-200 focus:!border-primary-500 !bg-gray-50/50 hover:!bg-white transition-colors"
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name="recipientPhoneNumber"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            {t('home.form.recipientLabel')}
                          </label>
                          <Input
                            {...field}
                            placeholder={t('home.form.recipientPlaceholder')}
                            className="!rounded-xl !border-gray-200 focus:!border-primary-500 !bg-gray-50/50 hover:!bg-white transition-colors"
                          />
                        </div>
                      )}
                    />
                  </fieldset>

                  <div className="space-y-4">
                    <Button
                      className="w-full !bg-primary-900 hover:!bg-primary-800 !py-4 !rounded-xl !text-base !font-semibold !shadow-lg !shadow-primary-900/20 transition-all duration-300 cursor-pointer"
                      isLoading={isLoading}
                      type="submit"
                      primary
                    >
                      {t('home.form.continue')}
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </Button>
                    <Link
                      to="/track"
                      className="flex items-center justify-center gap-2 text-gray-500 hover:text-primary-700 text-sm font-medium transition-colors py-2"
                    >
                      <span>Already have an order?</span>
                      <span className="text-primary-600 underline underline-offset-2">Track it here</span>
                    </Link>
                  </div>
                </div>
              </motion.form>
            </motion.aside>
          </motion.article>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gray-400"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative w-full py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

        <motion.article
          className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header className="text-center mb-16 lg:mb-20" variants={itemVariants as unknown as Variants}>
            <span className="inline-block text-primary-600 font-semibold text-sm tracking-wider uppercase mb-4">
              Our Promise
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.features.subtitle')}
            </p>
          </motion.header>

          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.li
                key={index}
                variants={itemVariants as unknown as Variants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="group relative h-full bg-white rounded-2xl p-8 shadow-lg shadow-gray-900/5 border border-gray-100 hover:shadow-xl hover:shadow-primary-900/10 transition-all duration-500">
                  {/* Gradient accent on hover */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <FontAwesomeIcon icon={feature.icon} className="text-white text-xl" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.article>
      </section>

      {/* How It Works Section */}
      <section className="relative w-full py-24 lg:py-32 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        {/* Geometric overlay - speed lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="speedLines" width="20" height="10" patternUnits="userSpaceOnUse">
                <path d="M0 5 L20 5" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#speedLines)" />
          </svg>
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 border border-white/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-60 h-60 border border-primary-400/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        <motion.article
          className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header className="text-center mb-16 lg:mb-20" variants={itemVariants as unknown as Variants}>
            <span className="inline-block text-primary-300 font-semibold text-sm tracking-wider uppercase mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto leading-relaxed">
              {t('home.howItWorks.subtitle')}
            </p>
          </motion.header>

          <motion.ol
            className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            variants={containerVariants}
          >
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary-400/0 via-primary-400/50 to-primary-400/0" />

            {howItWorks.map((step, index) => (
              <motion.li
                key={index}
                className="relative text-center"
                variants={itemVariants as unknown as Variants}
              >
                <div className="relative inline-flex items-center justify-center mb-8">
                  <motion.div
                    className="absolute w-24 h-24 rounded-full bg-primary-400/10"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  />
                  <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-bold text-primary-900">{step.step}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-primary-200 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </motion.article>
      </section>

      {/* Testimonials Section */}
      <section className="relative w-full py-24 lg:py-32 bg-gray-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />

        <motion.article
          className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.header className="text-center mb-16" variants={itemVariants as unknown as Variants}>
            <span className="inline-block text-primary-600 font-semibold text-sm tracking-wider uppercase mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.testimonials.subtitle')}
            </p>
          </motion.header>

          {/* Testimonial Carousel */}
          <motion.div className="relative max-w-4xl mx-auto" variants={itemVariants as unknown as Variants}>
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-900/10 p-8 sm:p-12 lg:p-16 overflow-hidden">
              {/* Large quote mark */}
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute top-8 left-8 text-6xl text-gray-100"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  <blockquote className="text-xl sm:text-2xl lg:text-3xl text-gray-700 font-medium leading-relaxed mb-8">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>

                  <footer className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-700 to-primary-900 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xl font-bold text-white">
                        {testimonials[activeTestimonial].name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-lg font-bold text-gray-900">
                        {testimonials[activeTestimonial].name}
                      </span>
                      <span className="text-gray-500">
                        {testimonials[activeTestimonial].role}
                      </span>
                    </div>
                  </footer>
                </motion.div>
              </AnimatePresence>

              {/* Navigation dots */}
              <div className="flex items-center justify-center gap-3 mt-10">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${index === activeTestimonial
                        ? 'bg-primary-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:scale-110 transition-all cursor-pointer"
              aria-label="Previous testimonial"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:scale-110 transition-all cursor-pointer"
              aria-label="Next testimonial"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </motion.div>
        </motion.article>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-24 lg:py-32 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950" />

        {/* Speed lines pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="ctaLines" width="30" height="15" patternUnits="userSpaceOnUse">
                <path d="M0 7.5 Q15 5 30 7.5" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaLines)" />
          </svg>
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-10 left-[10%] w-32 h-32 bg-white/5 rounded-full blur-2xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-[10%] w-48 h-48 bg-white/5 rounded-full blur-2xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.article
          className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants as unknown as Variants}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-sm">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg sm:text-xl text-primary-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('home.cta.subtitle')}
            </p>

            <motion.button
              onClick={scrollToForm}
              className="group relative inline-flex items-center gap-3 bg-white text-primary-900 px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-black/20 overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <span className="absolute inset-0 bg-primary-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative">{t('home.cta.button')}</span>
              <FontAwesomeIcon icon={faArrowRight} className="relative group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.article>
      </section>
    </main>
  );
};

export default Home;
