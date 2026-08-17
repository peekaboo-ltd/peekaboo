import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppSelector } from "@/states/hooks";
import { useGetPublicOrder } from "@/hooks/orders/orders.hooks";
import { KpayPaymentStatus } from "@/types/payment.types";
import type { UUID } from "@/types";
import Button from "@/components/inputs/Button";
import AdministrativeLocation from "@/containers/locations/AdministrativeLocation";
import { formatCurrency } from "@/utils/strings.util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCopy } from "@fortawesome/free-regular-svg-icons";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/common/useDocumentTitle";
import { useGetPublicPaymentStatusQuery } from "@/api/queries/payments.queries";

const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block animate-pulse rounded bg-slate-100 ${className}`}
  />
);

const PublicOrderPaymentSuccess = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [copiedReference, setCopiedReference] = useState<
    "payment" | "order" | null
  >(null);
  useDocumentTitle("Payment Successful");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId") || "";

  const { id } = useParams();
  const { order } = useAppSelector((state) => state.order);
  const currentOrder = order?.id === id ? order : undefined;

  const { getPublicOrder, isFetching: orderLoading } = useGetPublicOrder();
  const exactPaymentQuery = useGetPublicPaymentStatusQuery(
    { paymentId, entityId: id || "" },
    { skip: !id || !paymentId },
  );

  useEffect(() => {
    if (id) {
      getPublicOrder({ id: id as UUID });
    }
  }, [id, getPublicOrder]);

  useEffect(() => {
    const exactPayment = exactPaymentQuery.data?.data;
    if (
      id &&
      paymentId &&
      exactPayment &&
      exactPayment.status !== KpayPaymentStatus.SUCCESSFUL
    ) {
      navigate(`/p/orders/${id}/payment-pending?paymentId=${paymentId}`, {
        replace: true,
      });
    }
  }, [exactPaymentQuery.data?.data, id, navigate, paymentId]);

  const exactPayment = exactPaymentQuery.data?.data;
  const successfulPayment =
    exactPayment?.status === KpayPaymentStatus.SUCCESSFUL
      ? exactPayment
      : undefined;

  useEffect(() => {
    if (!successfulPayment) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ps-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".ps-reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [successfulPayment]);

  const copyReference = (value: string, field: "payment" | "order") => {
    void navigator.clipboard.writeText(value);
    toast.success(
      `${field === "payment" ? "Payment" : "Order"} reference copied to clipboard`,
    );
    setCopiedReference(field);
    window.setTimeout(() => setCopiedReference(null), 2000);
  };

  if (
    paymentId &&
    !exactPaymentQuery.error &&
    (exactPaymentQuery.isLoading ||
      exactPaymentQuery.isFetching ||
      !successfulPayment)
  ) {
    return (
      <main className="min-h-[70vh] bg-[#FAFAF7] px-4 py-16 sm:px-6">
        <section
          className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#edb100] motion-reduce:animate-none" />
          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Confirming your payment
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We are checking the completed transaction before showing the receipt.
          </p>
        </section>
      </main>
    );
  }

  if (!successfulPayment || exactPaymentQuery.error) {
    return (
      <main className="min-h-[70vh] bg-[#FAFAF7] px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Payment confirmation unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            We could not verify a completed payment for this order. Return to the
            order to check its current status.
          </p>
          {id ? (
            <Button primary route={`/p/orders/${id}`} className="mt-6">
              Return to order
            </Button>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ps-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .ps-reveal.ps-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .ps-reveal:nth-child(2) { transition-delay: 0.08s; }
        .ps-reveal:nth-child(3) { transition-delay: 0.16s; }
        .ps-reveal:nth-child(4) { transition-delay: 0.24s; }
        @media (prefers-reduced-motion: reduce) {
          .ps-reveal { opacity: 1; transform: none; transition: none; }
        }
      `,
        }}
      />

      <main className="min-h-screen bg-[#FAFAF7] bg-opacity-50 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <header className="ps-reveal mb-8 border border-slate-200 rounded-lg p-6 sm:p-8 text-center">
            <figure className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
            </figure>
            <p className="mb-2 text-xs uppercase st text-slate-600">
              Payment confirmed
            </p>
            <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Your order is ready for the next step
            </h1>
            <p className="text-sm text-slate-500">
              We&apos;ve received your payment and your delivery request is now
              moving into rider assignment.
            </p>
          </header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
            {/* Left column */}
            <div className="space-y-5">
              {/* Payment details */}
              <article className="ps-reveal border border-slate-200 rounded-lg p-5 sm:p-6">
                <header className="mb-4 border-b border-slate-100 pb-4">
                  <p className="text-xs uppercase st text-slate-600 mb-1">
                    Payment details
                  </p>
                  <p className="text-sm text-slate-700">
                    Transaction confirmation
                  </p>
                </header>

                {exactPaymentQuery.isFetching ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                      >
                        <SkeletonLine className="h-3 w-28" />
                        <SkeletonLine className="h-3 w-36" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <dl className="space-y-4">
                    {successfulPayment.externalReferenceId && (
                      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <dt className="text-xs text-slate-600 uppercase ">
                          Payment Reference
                        </dt>
                        <dd className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                          <code className="break-all rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                            {successfulPayment.externalReferenceId}
                          </code>
                          <button
                            type="button"
                            onClick={() =>
                              copyReference(
                                successfulPayment.externalReferenceId,
                                "payment",
                              )
                            }
                            className="cursor-pointer rounded border border-slate-200 p-1.5 text-slate-600 transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                            aria-label="Copy payment reference to clipboard"
                          >
                            <FontAwesomeIcon
                              icon={
                                copiedReference === "payment"
                                  ? faCheckCircle
                                  : faCopy
                              }
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </dd>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-xs text-slate-600 uppercase ">
                        Order Reference
                      </dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        {orderLoading ? (
                          <SkeletonLine className="h-6 w-40" />
                        ) : (
                          <>
                            <code className="break-all rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                              {currentOrder?.referenceId ?? "—"}
                            </code>
                            {currentOrder?.referenceId && (
                              <button
                                type="button"
                                onClick={() =>
                                  copyReference(
                                    currentOrder.referenceId,
                                    "order",
                                  )
                                }
                                className="cursor-pointer rounded border border-slate-200 p-1.5 text-slate-600 transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                aria-label="Copy reference ID to clipboard"
                              >
                                <FontAwesomeIcon
                                  icon={
                                    copiedReference === "order"
                                      ? faCheckCircle
                                      : faCopy
                                  }
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            )}
                          </>
                        )}
                      </dd>
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-xs text-slate-600 uppercase ">
                        Amount Paid
                      </dt>
                      <dd className="text-lg text-slate-900">
                        {orderLoading ? (
                          <SkeletonLine className="h-6 w-24" />
                        ) : (
                          formatCurrency(successfulPayment.amount)
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </article>

              {/* Order summary */}
              <article className="ps-reveal border border-slate-200 rounded-lg p-5 sm:p-6">
                <header className="mb-5 border-b border-slate-100 pb-4">
                  <p className="text-xs uppercase st text-slate-600 mb-1">
                    Order summary
                  </p>
                  <p className="text-sm text-slate-700">
                    Pickup and delivery overview
                  </p>
                </header>

                {orderLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3"
                      >
                        <SkeletonLine className="h-3 w-24" />
                        <SkeletonLine className="h-3 w-36" />
                        <SkeletonLine className="h-3 w-28" />
                        <SkeletonLine className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <section className="grid gap-4 sm:grid-cols-2">
                    <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-3 text-xs uppercase st text-slate-600">
                        Pickup
                      </p>
                      {currentOrder?.locationFrom ? (
                        <ul className="space-y-2">
                          <AdministrativeLocation
                            location={currentOrder.locationFrom}
                          />
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-600">Not set</p>
                      )}
                    </article>

                    <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-3 text-xs uppercase st text-slate-600">
                        Destination
                      </p>
                      {currentOrder?.locationTo ? (
                        <ul className="space-y-2">
                          <AdministrativeLocation location={currentOrder.locationTo} />
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-600">Not set</p>
                      )}
                    </article>
                  </section>
                )}

                {!orderLoading && (
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase st text-slate-600">
                        Delivery fee
                      </p>
                    </div>
                    <p className="text-base text-slate-900">
                      {formatCurrency(
                        currentOrder?.finalFee ?? currentOrder?.initialFee ?? 0,
                      )}
                    </p>
                  </div>
                )}
              </article>
            </div>

            {/* Right column */}
            <aside className="space-y-5">
              <article className="ps-reveal border border-slate-200 rounded-lg p-5 sm:p-6">
                <header className="mb-4 border-b border-slate-100 pb-4">
                  <p className="text-xs uppercase st text-slate-600 mb-1">
                    What happens next
                  </p>
                  <p className="text-sm text-slate-700">
                    Delivery progress after payment
                  </p>
                </header>

                <ol className="space-y-4">
                  {[
                    "Your order is being assigned to a nearby rider.",
                    "Once assigned, you can track your order in real time.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </article>
            </aside>
          </div>
          <footer className="flex items-center gap-3 justify-between mt-5">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              route="#"
            >
              Back
            </Button>
            <Button primary route={`/p/orders/${id}/tracking`}>
              Track Order
            </Button>
          </footer>
        </div>
      </main>
    </>
  );
};

export default PublicOrderPaymentSuccess;
