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

const Home = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

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
      title: 'Fast Delivery',
      description:
        'Same-day delivery within Kigali. Get your packages delivered in hours, not days.',
    },
    {
      icon: faShieldHalved,
      title: 'Secure & Safe',
      description:
        'All our riders are verified and trained. Your packages are in trusted hands.',
    },
    {
      icon: faClock,
      title: 'Real-time Tracking',
      description:
        'Track your package in real-time from pickup to delivery. Stay informed every step.',
    },
    {
      icon: faMapLocationDot,
      title: 'City-wide Coverage',
      description:
        'We cover all areas in Kigali. No location is too far for our dedicated riders.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Enter Details',
      description:
        'Provide your phone number and the recipient\'s number to get started.',
    },
    {
      step: '02',
      title: 'Get Matched',
      description:
        'We\'ll match you with a verified rider in your area instantly.',
    },
    {
      step: '03',
      title: 'Track & Receive',
      description:
        'Track your package in real-time until it reaches its destination.',
    },
  ];

  const testimonials = [
    {
      name: 'Marie Claire N.',
      role: 'Business Owner',
      content:
        'Peekaboo has transformed how I deliver products to my customers. Fast, reliable, and professional service every time.',
    },
    {
      name: 'Jean Pierre M.',
      role: 'E-commerce Seller',
      content:
        'The real-time tracking feature gives my customers peace of mind. I\'ve seen a significant increase in repeat orders.',
    },
    {
      name: 'Alice K.',
      role: 'Regular Customer',
      content:
        'I use Peekaboo to send packages to my family. It\'s so convenient and the riders are always courteous.',
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
                Trusted by 1000+ customers in Kigali
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fast & Reliable
                <span className="text-primary block">Package Delivery</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
                Connect with trusted riders in your area for quick and secure
                package delivery services. Same-day delivery across Kigali.
              </p>
              <nav className="flex gap-4 justify-center lg:justify-start">
                <Link
                  to="/about"
                  className="text-primary-700 font-medium hover:text-primary-800 transition-colors"
                >
                  Learn more about us
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
                    Send a package
                  </h2>
                  <p className="text-sm text-gray-600">
                    Enter your phone number and the recipient's to get matched
                    with one of our riders.
                  </p>
                </header>

                <fieldset className="w-full flex flex-col gap-4 mb-6">
                  <Controller
                    name="senderPhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <label className="w-full flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Your phone number
                        </span>
                        <Input {...field} placeholder="Enter your phone number" />
                      </label>
                    )}
                  />
                  <Controller
                    name="recipientPhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <label className="w-full flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Recipient's phone number
                        </span>
                        <Input
                          {...field}
                          placeholder="Enter the recipient's phone number"
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
                  Continue
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
                Why Choose Peekaboo?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We provide reliable and efficient delivery services that help you
                connect with your customers faster.
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
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Sending a package is as easy as 1-2-3. Get started in minutes.
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
                What Our Customers Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Don't just take our word for it. Here's what our customers have
                to say about Peekaboo.
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
              Ready to Send Your First Package?
            </h2>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-8">
              Join thousands of satisfied customers who trust Peekaboo for their
              delivery needs.
            </p>
            <Button
              primary
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-primary-900 hover:bg-gray-100 mx-auto w-fit"
            >
              Get Started Now
            </Button>
          </article>
        </section>

      </main>
    </>
  );
};

export default Home;
