import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
import { useGetOrder } from '@/hooks/orders/orders.hooks';
import { useFetchPayments } from '@/hooks/payments/payment.hooks';
import { KpayPaymentStatus, PaymentType } from '@/types/payment.types';
import type { UUID } from '@/types';
import Button from '@/components/inputs/Button';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import { formatCurrency } from '@/utils/strings.util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCopy } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const PublicOrderPaymentSuccess = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  useDocumentTitle('Payment Successful');

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

  // STATE VARIABLES
  const { id } = useParams();
  const { order } = useAppSelector((state) => state.order);
  const { paymentsList } = useAppSelector((state) => state.payment);

  // HOOKS
  const { getOrder } = useGetOrder();
  const { fetchPayments } = useFetchPayments();

  // Fetch order details
  useEffect(() => {
    if (id) {
      getOrder({ id: id as UUID });
    }
  }, [id, getOrder]);

  // Fetch payments
  useEffect(() => {
    if (order?.id) {
      fetchPayments({ entityId: order?.id, paymentType: PaymentType.ORDER });
    }
  }, [fetchPayments, order?.id]);

  // Get successful payment
  const successfulPayment = paymentsList?.find(
    (payment) => payment.status === KpayPaymentStatus.SUCCESSFUL
  );

  // Handle copy reference ID
  const handleCopyReferenceId = () => {
    if (order?.referenceId) {
      navigator.clipboard.writeText(order.referenceId);
      toast.success('Reference ID copied to clipboard');
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

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

      <main className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-12">
        <section className="max-w-7xl mx-auto">
          {/* Success Header */}
          <header className="text-center mb-6 sm:mb-8 animate-on-scroll">
            <figure className="flex justify-center mb-4">
              <span
                className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center"
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  size='lg'
                  className="text-black"
                  aria-hidden="true"
                />
              </span>
            </figure>
            <h1 className="text-xl uppercase sm:text-xl lg:text-2xl font-bold text-black mb-2 px-2">
              Payment Successful
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Your order is being prepared for delivery
            </p>
          </header>

          {/* Payment Details Card */}
          {successfulPayment && (
            <article className="bg-white rounded-sm shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-100 animate-on-scroll">
              <header className="mb-4">
                <h2 className="text-sm sm:text-md uppercase font-semibold text-gray-800 mb-1">
                  Payment Details
                </h2>
                <p className="text-xs text-gray-500">
                  Transaction confirmation information
                </p>
              </header>
              <dl className="space-y-3">
                <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                    Payment Reference
                  </dt>
                  <dd className="text-sm text-gray-900">
                    <Link
                      to={`https://kpay.co.rw/transactions/${successfulPayment.externalReferenceId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-primary-600"
                    >
                      {successfulPayment.externalReferenceId}
                    </Link>
                  </dd>
                </section>
                <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                    Order Reference
                  </dt>
                  <dd className="text-sm text-gray-900 flex items-center gap-2">
                    <span className="break-all">{order?.referenceId}</span>
                    <button
                      type="button"
                      onClick={handleCopyReferenceId}
                      className="p-1 hover:text-primary cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label="Copy reference ID to clipboard"
                    >
                      <FontAwesomeIcon
                        icon={isCopied ? faCheckCircle : faCopy}
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                    </button>
                  </dd>
                </section>
                <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                  <dt className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                    Amount Paid
                  </dt>
                  <dd className="text-lg font-bold text-black">
                    {formatCurrency(order?.finalFee ?? order?.initialFee ?? 0)}
                  </dd>
                </section>
              </dl>
            </article>
          )}

          {/* Order Summary Card */}
          {order && (
            <article className="bg-white rounded-sm shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-100 animate-on-scroll">
              <header className="mb-6">
                <h2 className="text-sm sm:text-md uppercase font-semibold text-gray-800 mb-1">
                  Order Summary
                </h2>
                <p className="text-xs text-gray-500">
                  Delivery route and details
                </p>
              </header>
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Pickup Location */}
                <article className="bg-gray-50 rounded-sm p-4 sm:p-5">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Pickup Location
                  </h3>
                  {order.locationFrom ? (
                    <ul className='w-full grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <AdministrativeLocation location={order?.locationFrom} />
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Not set</p>
                  )}
                </article>

                {/* Delivery Location */}
                <article className="bg-gray-50 rounded-sm p-4 sm:p-5">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Delivery Destination
                  </h3>
                  {order.locationTo ? (
                    <ul className='w-full grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <AdministrativeLocation location={order?.locationTo} />
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Not set</p>
                  )}
                </article>
              </section>

              {/* Delivery Info */}
              <section className="bg-gray-50 rounded-sm p-4 sm:p-5">
                  <section className="text-center flex items-center gap-2 justify-between">
                    <dt className="text-xs text-gray-500">Delivery Fee</dt>
                    <dd className="text-lg font-bold text-black">
                      {formatCurrency(order?.finalFee ?? order?.initialFee ?? 0)}
                    </dd>
                  </section>
              </section>
            </article>
          )}

          {/* Next Steps Card */}
          <article className="bg-blue-50 rounded-sm shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-blue-100 animate-on-scroll">
            <header className="mb-3">
              <h2 className="text-sm sm:text-md uppercase font-semibold text-gray-800 mb-1">
                What Happens Next?
              </h2>
            </header>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>
                  Your order is being assigned to a nearby rider
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>
                  Once assigned, you can track your order in real-time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>
                  The rider will pick up your package and deliver it to the destination
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>
                  You'll receive updates at each stage of the delivery
                </span>
              </li>
            </ol>
          </article>

          {/* Footer Actions */}
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-on-scroll">
            <Button route={`/p/orders/${order?.id}`} className="cursor-pointer">
              View Order Details
            </Button>
            <Button primary route={`/p/orders/${order?.id}/tracking`} className="cursor-pointer">
              Track Order
            </Button>
          </footer>
        </section>
      </main>
    </>
  );
};

export default PublicOrderPaymentSuccess;
