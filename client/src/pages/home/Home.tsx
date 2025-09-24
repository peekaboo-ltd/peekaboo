import { Controller, useForm, type FieldValues } from 'react-hook-form';
import Input from '../../components/inputs/Input';
import { useCreatePublicOrder } from '../../hooks/orders/orders.hooks';
import Button from '@/components/inputs/Button';
import { useEffect, useRef } from 'react';

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

  // REACT HOOK FORM
  const { control, handleSubmit } = useForm();

  // ORDER HOOKS
  const { createPublicOrder, isLoading } = useCreatePublicOrder();

  // HANDLE FORM SUBMISSION
  const onSubmit = handleSubmit((data: FieldValues) => {
    createPublicOrder({
      senderPhoneNumber: data?.senderPhoneNumber,
      recipientPhoneNumber: data?.recipientPhoneNumber,
    });
  });

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

      <main className="h-screen w-screen overflow-hidden bg-gray-100 fixed top-0 left-0">
        <section className="h-full w-full max-w-[1330px] mx-auto flex items-center justify-between px-12 pt-20">
          <article className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <section className="w-full flex flex-col gap-6 text-center lg:text-left animate-on-scroll">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fast & Reliable
                <span className="text-primary block">Package Delivery</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
                Connect with trusted riders in your area for quick and secure
                package delivery services.
              </p>
            </section>

            <aside className="w-full flex justify-center lg:justify-end animate-on-scroll">
              <form
                onSubmit={onSubmit}
                className="w-full max-w-xl bg-white rounded-sm shadow-xl p-8 border border-gray-100"
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
                        <p className="text-sm font-medium text-gray-700">
                          Your phone number
                        </p>
                        <Input {...field} placeholder="Enter your phone number" />
                      </label>
                    )}
                  />
                  <Controller
                    name="recipientPhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <label className="w-full flex flex-col gap-2">
                        <p className="text-sm font-medium text-gray-700">
                          Recipient's phone number
                        </p>
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
      </main>
    </>
  );
};

export default Home;
