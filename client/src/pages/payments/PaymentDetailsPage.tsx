import Button from '@/components/inputs/Button';
import { Badge } from '@/components/ui/badge';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetOrder } from '@/hooks/orders/orders.hooks';
import { useGetPayment } from '@/hooks/payments/payment.hooks';
import { useAppSelector } from '@/states/hooks';
import { UUID } from '@/types';
import { KpayPaymentStatus, PaymentType } from '@/types/payment.types';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAddressCard,
  faCalendarDay,
  faCircleCheck,
  faClockRotateLeft,
  faEnvelope,
  faFileLines,
  faHashtag,
  faMoneyBillWave,
  faPhone,
  faReceipt,
  faTruckFast,
  faUser,
  faUserGear,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import { motion, Variants } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const formatDateLabel = (value?: string | Date) => {
  if (!value) return '—';
  return formatDate(value, 'DD/MM/YYYY HH:mm');
};

const paymentStatusLabelMap: Record<KpayPaymentStatus, string> = {
  [KpayPaymentStatus.SUCCESSFUL]: 'Successful',
  [KpayPaymentStatus.PENDING]: 'Pending',
  [KpayPaymentStatus.FAILED]: 'Failed',
};

const paymentStatusBadgeVariantMap: Record<
  KpayPaymentStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [KpayPaymentStatus.SUCCESSFUL]: 'default',
  [KpayPaymentStatus.PENDING]: 'secondary',
  [KpayPaymentStatus.FAILED]: 'destructive',
};

const methodLabelMap: Record<string, string> = {
  momo: 'Mobile Money',
  bank: 'Bank',
  cc: 'Credit Card',
  smartcash: 'SmartCash',
  spenn: 'Spenn',
};

const PaymentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle('Payment details');

  const { payment } = useAppSelector((state) => state.payment);
  const { order } = useAppSelector((state) => state.order);

  const { getPayment, isFetching: isFetchingPayment } = useGetPayment();
  const { getOrder, isFetching: isFetchingOrder } = useGetOrder();

  useEffect(() => {
    if (id) {
      getPayment(id as UUID);
    }
  }, [id, getPayment]);

  useEffect(() => {
    if (
      payment?.type === PaymentType.ORDER &&
      payment?.entityId
    ) {
      getOrder({ id: payment.entityId as UUID });
    }
  }, [payment?.entityId, payment?.type, getOrder]);

  if (isFetchingPayment && !payment) {
    return (
      <main className="w-full flex items-center justify-center py-16">
        <p className="text-sm text-slate-500">Loading payment details...</p>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="w-full flex flex-col gap-4 py-8">
        <p className="text-sm text-slate-500">Payment not found.</p>
        <menu className="w-full flex items-center gap-3">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
        </menu>
      </main>
    );
  }

  const amount = Number(payment.amount || 0);
  const paymentStatusLabel =
    paymentStatusLabelMap[payment.status as KpayPaymentStatus] || payment.status;

  const linkedOrder =
    payment.type === PaymentType.ORDER && order?.id === payment.entityId
      ? order
      : undefined;

  const stats = [
    {
      label: 'Payment Status',
      value: paymentStatusLabel,
      icon:
        payment.status === KpayPaymentStatus.SUCCESSFUL
          ? faCircleCheck
          : payment.status === KpayPaymentStatus.FAILED
            ? faXmarkCircle
            : faClockRotateLeft,
    },
    {
      label: 'Amount',
      value: formatCurrency(amount, payment.currency),
      icon: faMoneyBillWave,
    },
    {
      label: 'Updated At',
      value: formatDateLabel(payment.updatedAt),
      icon: faCalendarDay,
    },
  ];

  return (
    <motion.main
      className="relative w-full mx-auto flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(95,149,152,0.18),_transparent_65%)]" />

      <motion.section
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]"
        variants={itemVariants}
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />

        <header className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <section className="flex items-center gap-5">
            <figure className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white flex items-center justify-center text-2xl font-medium shadow-lg">
              <FontAwesomeIcon icon={faReceipt} />
            </figure>
            <section>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Payment Overview
              </p>
              <h1 className="mt-2 text-2xl font-medium text-slate-900 sm:text-3xl break-all">
                {payment?.externalReferenceId}
              </h1>
              <p className="mt-2 text-[13px] text-slate-600">
                Transaction details, customer information, and linked entity context.
              </p>
            </section>
          </section>
          <aside>
            <Badge
              variant={paymentStatusBadgeVariantMap[payment.status as KpayPaymentStatus] ?? 'outline'}
              className="text-xs"
            >
              {paymentStatusLabel}
            </Badge>
          </aside>
        </header>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.35)]"
          >
            <header className="flex items-center justify-between">
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-md font-medium text-slate-900">
                  {stat.value}
                </p>
              </section>
              <span className="h-11 w-11 rounded-xl bg-primary-50 text-primary-900 flex items-center justify-center">
                <FontAwesomeIcon icon={stat.icon} />
              </span>
            </header>
          </article>
        ))}
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <article className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)]">
          <header className="flex items-center justify-between gap-4">
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Payment Details
              </p>
              <h2 className="mt-2 text-lg font-medium text-slate-900">
                Core Transaction Information
              </h2>
            </section>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Created {formatDateLabel(payment.createdAt)}
            </span>
          </header>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                label: 'Entity Type',
                value: payment.type,
                icon: faAddressCard,
              },
              {
                label: 'External Reference',
                value: payment.externalReferenceId,
                icon: faFileLines,
              },
              {
                label: 'Method',
                value: methodLabelMap[payment.method] || payment.method,
                icon: faMoneyBillWave,
              },
              {
                label: 'Currency',
                value: payment.currency,
                icon: faMoneyBillWave,
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-white text-primary-900 shadow-sm flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 break-all">
                      {item.value || '—'}
                    </p>
                  </section>
                </header>
              </li>
            ))}

            <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:col-span-2">
              <header className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-lg bg-white text-primary-900 shadow-sm flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileLines} />
                </span>
                <section>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Description
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {payment.description || 'No description provided.'}
                  </p>
                </section>
              </header>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)]">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Customer & Entity Context
            </p>
            <h2 className="mt-2 text-lg font-medium text-slate-900">
              Related Information
            </h2>
          </header>

          <section className="mt-6 flex flex-col gap-4">
            {[
              {
                label: 'Customer Name',
                value: payment.customerName,
                icon: faUser,
              },
              {
                label: 'Customer Email',
                value: payment.customerEmail,
                icon: faEnvelope,
              },
              {
                label: 'Customer Phone',
                value: payment.customerPhone,
                icon: faPhone,
              },
              {
                label: 'Created By',
                value: payment.createdBy?.email,
                icon: faUserGear,
              },
              {
                label: 'Linked Order Ref',
                value:
                  payment.type === PaymentType.ORDER
                    ? isFetchingOrder
                      ? 'Loading order...'
                      : linkedOrder?.referenceId || 'Order not found'
                    : 'N/A',
                icon: faTruckFast,
              },
              {
                label: 'Linked Order Status',
                value:
                  payment.type === PaymentType.ORDER
                    ? isFetchingOrder
                      ? 'Loading order...'
                      : linkedOrder?.status || '—'
                    : 'N/A',
                icon: faCircleCheck,
              },
              {
                label: 'Linked Order OTP',
                value:
                  payment.type === PaymentType.ORDER
                    ? isFetchingOrder
                      ? 'Loading order...'
                      : linkedOrder?.trackingId || '—'
                    : 'N/A',
                icon: faHashtag,
              },
              {
                label: 'Updated At',
                value: formatDateLabel(payment.updatedAt),
                icon: faCalendarDay,
              },
            ].map((item) => (
              <article
                key={item.label}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <span className="mt-0.5 h-8 w-8 rounded-lg bg-white text-primary-900 shadow-sm flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <section>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 break-all">
                    {item.value || '—'}
                  </p>
                </section>
              </article>
            ))}
          </section>
        </article>
      </motion.section>

      <motion.menu
        variants={itemVariants}
        className="w-full flex items-center gap-3 justify-between"
      >
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          Back
        </Button>
      </motion.menu>
    </motion.main>
  );
};

export default PaymentDetailsPage;
