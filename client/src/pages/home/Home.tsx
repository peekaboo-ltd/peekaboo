import { Controller, useForm, type FieldValues } from 'react-hook-form';
import Input from '../../components/inputs/Input';
import { useCreatePublicOrder } from '../../hooks/orders/orders.hooks';
import Button from '@/components/inputs/Button';
import { useEffect, useRef } from 'react';
import { formatPhone } from '@/utils/strings.util';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faShieldHalved,
  faClock,
  faMapLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useI18n } from '@/i18n/i18n';

const Home = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data: landingStats } = useGetLandingStatsQuery();
  const { t } = useI18n();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const { control, handleSubmit } = useForm();
  const { createPublicOrder, isLoading } = useCreatePublicOrder();

  const onSubmit = handleSubmit((data: FieldValues) => {
    createPublicOrder({
      senderPhoneNumber: formatPhone(data?.senderPhoneNumber),
      recipientPhoneNumber: formatPhone(data?.recipientPhoneNumber),
    });
  });

  const features = [
    {
      icon: faTruck,
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

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .animate-fade-in-up {
            animation: fadeInUp 1.2s ease-out forwards;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-on-scroll {
            opacity: 0;
            transform: translateY(50px);
            transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          }

          html {
            scroll-behavior: smooth;
          }
        `,
        }}
      />

      <main className="min-h-screen w-full bg-gray-50">
        {/* Hero Section */}
        <section className="min-h-screen w-full max-w-[1330px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-20">
          <article className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <section className="w-full flex flex-col gap-6 text-center lg:text-left animate-on-scroll">
              <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium w-fit mx-auto lg:mx-0">
                {typeof landingStats?.activeCustomers === 'number'
                  ? t('home.hero.badgeWithCount', { count: landingStats.activeCustomers })
                  : t('home.hero.badgeLoading')}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('home.hero.title1')}
                <span className="text-primary block">{t('home.hero.title2')}</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
                {t('home.hero.subtitle')}
              </p>

              <nav className="flex gap-4 justify-center lg:justify-start">
                <Link
                  to="/about"
                  className="text-primary-700 font-medium hover:text-primary-800 transition-colors"
                >
                  {t('home.hero.learnMore')}
                </Link>
              </nav>
            </section>

            <aside className="w-full flex justify-center lg:justify-end animate-on-scroll">
              <form
                onSubmit={onSubmit}
                className="w-full max-w-xl bg-white rounded-sm shadow-xl p-8 sm:p-6 lg:p-10 border border-gray-100"
              >
                <header className="w-full flex flex-col gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('home.form.title')}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t('home.form.subtitle')}
                  </p>
                </header>

                <fieldset className="w-full flex flex-col gap-4 mb-6">
                  <Controller
                    name="senderPhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <label className="w-full flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {t('home.form.senderLabel')}
                        </span>
                        <Input {...field} placeholder={t('home.form.senderPlaceholder')} />
                      </label>
                    )}
                  />
                  <Controller
                    name="recipientPhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <label className="w-full flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {t('home.form.recipientLabel')}
                        </span>
                        <Input
                          {...field}
                          placeholder={t('home.form.recipientPlaceholder')}
                        />
                      </label>
                    )}
                  />
                </fieldset>

                <Button
                  className="w-full bg-primary-900 p-4 rounded-xs cursor-pointer"
                  isLoading={isLoading}
                  type="submit"
                  primary
                >
                  {t('home.form.continue')}
                </Button>
              </form>
            </aside>
          </article>
        </section>

        {/* Features Section */}
        <section className="w-full bg-white py-16 lg:py-24">
          <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
            <header className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </header>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="animate-on-scroll bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <figure className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <FontAwesomeIcon
                      icon={feature.icon}
                      className="text-primary-600 text-xl"
                    />
                  </figure>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* How It Works Section */}
        <section className="w-full bg-gray-50 py-16 lg:py-24">
          <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
            <header className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.howItWorks.subtitle')}
              </p>
            </header>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <li key={index} className="animate-on-scroll text-center">
                  <span className="inline-block text-5xl font-bold text-primary-200 mb-4">
                    {step.step}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </article>
        </section>

        {/* Testimonials Section */}
        <section className="w-full bg-white py-16 lg:py-24">
          <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
            <header className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t('home.testimonials.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.testimonials.subtitle')}
              </p>
            </header>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <li
                  key={index}
                  className="animate-on-scroll bg-gray-50 rounded-lg p-6"
                >
                  <blockquote className="text-gray-600 mb-4 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <footer className="flex items-center gap-3">
                    <figure className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </figure>
                    <address className="not-italic">
                      <span className="block font-semibold text-gray-900">
                        {testimonial.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {testimonial.role}
                      </span>
                    </address>
                  </footer>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-primary-900 py-16 lg:py-20">
          <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 text-center animate-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-8">
              {t('home.cta.subtitle')}
            </p>
            <Button
              primary
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-primary-900 hover:bg-gray-100 mx-auto w-fit"
            >
              {t('home.cta.button')}
            </Button>
          </article>
        </section>

      </main>
    </>
  );
};

export default Home;
