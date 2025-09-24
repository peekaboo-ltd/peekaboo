import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faHome } from '@fortawesome/free-solid-svg-icons';

const NotFoundPage = () => {
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

      <main className="w-full flex flex-col gap-6 items-center min-h-screen">
        <section className="w-[90vw] sm:w-[85vw] md:w-[80vw] max-w-5xl flex flex-col gap-6 sm:gap-8 lg:gap-10">
          {/* Hero Section */}
          <article className="animate-on-scroll w-full flex flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-12 lg:pt-16">
            {/* Hero Image */}
            <figure className="w-full flex flex-col items-center justify-center gap-4 lg:gap-6">
              <hgroup className="text-center space-y-2 sm:space-y-3">
                <h1 className="text-base sm:text-lg md:text-xl font-light uppercase tracking-[0.2em] text-gray-700">
                  404 - Page Not Found
                </h1>
                <hr className="w-12 sm:w-16 md:w-20 h-[1px] bg-gray-300 mx-auto border-0" />
              </hgroup>

              <img
                src="https://res.cloudinary.com/nishimweprince/image/upload/v1752340025/dawnlight-journeys/conservation-volunterring_ecnzn6.webp"
                alt="Peekaboo Delivery - Page not found"
                className="w-full h-[30vh] sm:h-[35vh] md:h-[40vh] lg:h-[45vh] object-cover rounded-sm shadow-2xl hover:scale-[1.01] hover:shadow-3xl transition-all duration-500 ease-out"
                loading="eager"
              />
            </figure>

            {/* Content */}
            <header className="w-full text-center space-y-3 sm:space-y-4 lg:space-y-6 px-4 sm:px-6 lg:px-8">
              <section className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-sm md:text-[15px] font-light text-gray-600 tracking-wide">
                  The page you're looking for seems to have taken a different delivery route
                </p>

                <p className="text-xs sm:text-sm md:text-sm font-light text-gray-500 leading-relaxed">
                  Just like our carefully tracked packages, every page has its destination.
                  This one might be getting rerouted, or perhaps it never existed at all.
                </p>
              </section>
            </header>
          </article>

          {/* Call to Action */}
          <section className="animate-on-scroll w-full pb-8 sm:pb-12 lg:pb-16">
            <header className="text-center mb-6 sm:mb-8 lg:mb-10 space-y-2 sm:space-y-3">
              <h2 className="text-sm sm:text-base md:text-lg font-light text-gray-700">
                Let's Get You Back on Track
              </h2>
              <hr className="w-8 sm:w-12 h-[1px] bg-gray-300 mx-auto border-0" />
            </header>

            <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 border border-gray-300 px-4 sm:px-6 py-2 uppercase text-xs sm:text-sm font-light tracking-wider text-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-300 rounded-sm"
              >
                <FontAwesomeIcon className="text-xs" icon={faHome} />
                Go Home
              </Link>

              <Link
                to="/p/orders"
                className="inline-flex items-center gap-2 bg-primary px-4 sm:px-6 py-2 uppercase text-xs sm:text-sm font-medium tracking-wider text-white hover:bg-primary/80 transition-all duration-300 rounded-sm"
              >
                Track Order
                <FontAwesomeIcon className="text-xs" icon={faChevronRight} />
              </Link>
            </nav>

            {/* Additional Links */}
            <aside className="mt-8 sm:mt-10 text-center">
              <p className="text-xs font-light text-gray-500 mb-3 sm:mb-4">
                Or explore these popular sections:
              </p>

              <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs">
                <Link
                  to="/about"
                  className="text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
                >
                  About Us
                </Link>
                <Link
                  to="/services"
                  className="text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
                >
                  Our Services
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
                >
                  Contact Support
                </Link>
                <Link
                  to="/p/orders"
                  className="text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
                >
                  Track Package
                </Link>
              </nav>
            </aside>
          </section>
        </section>
      </main>
    </>
  );
};

export default NotFoundPage;