import Button from '@/components/inputs/Button';
import { Badge } from '@/components/ui/badge';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetOrder } from '@/hooks/orders/orders.hooks';
import { useGetPayment } from '@/hooks/payments/payment.hooks';
import { useAppSelector } from '@/states/hooks';
import { UUID } from '@/types';
import { PREFERRED_CONTACT_METHOD_LABELS } from '@/types/order.type';
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
  faTruckFast,
  faUser,
  faUserGear,
  faComments,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import { motion, Variants } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
  InternalStatCard,
} from '@/components/layout/InternalPage';

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
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
    if (payment?.type === PaymentType.ORDER && payment?.entityId) {
      getOrder({ id: payment.entityId as UUID });
    }
  }, [payment?.entityId, payment?.type, getOrder]);

  if (isFetchingPayment && !payment) {
    return (
      <main className="w-full flex items-center justify-center py-16 min-h-screen">
        <p className="text-sm text-(--muted)">Loading payment details…</p>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 min-h-screen px-4">
        <p className="text-sm text-(--muted)">Payment not found.</p>
        <menu className="w-full flex items-center gap-3">
          <Button type="button" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
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
    payment.type === PaymentType.ORDER && order?.id === payment.entityId ? order : undefined;

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
      // Settled payments carry their outcome; one still in flight stays grey.
      iconBg: payment.status === KpayPaymentStatus.SUCCESSFUL
        ? 'bg-(--approve-surface) text-(--approve)'
        : payment.status === KpayPaymentStatus.FAILED
          ? 'bg-(--danger-surface) text-(--danger)'
          : 'bg-(--surface) text-(--muted)',
    },
    {
      label: 'Amount',
      value: formatCurrency(amount, payment.currency),
      icon: faMoneyBillWave,
      iconBg: 'bg-(--ink) text-(--paper)',
    },
    {
      label: 'Updated At',
      value: formatDateLabel(payment.updatedAt),
      icon: faCalendarDay,
      iconBg: 'bg-(--surface) text-(--muted)',
    },
  ];

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Payment Overview"
          title={payment?.externalReferenceId}
          description="Transaction details, customer information, and linked entity context."
          actions={
            <Badge
              variant={paymentStatusBadgeVariantMap[payment.status as KpayPaymentStatus] ?? 'outline'}
              className="text-xs rounded-full px-3"
            >
              {paymentStatusLabel}
            </Badge>
          }
        />
      </motion.section>

      {/* Stats */}
      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <InternalStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={<FontAwesomeIcon icon={stat.icon} />}
          />
        ))}
      </motion.section>

      {/* Details */}
      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <InternalSectionCard
          className="lg:col-span-2"
          eyebrow="Payment Details"
          title="Core Transaction Information"
          actions={
            <span className="type-meta">
              Created {formatDateLabel(payment.createdAt)}
            </span>
          }
        >
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Entity Type', value: payment.type, icon: faAddressCard },
              { label: 'External Reference', value: payment.externalReferenceId, icon: faFileLines },
              { label: 'Method', value: methodLabelMap[payment.method] || payment.method, icon: faMoneyBillWave },
              { label: 'Currency', value: payment.currency, icon: faMoneyBillWave },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-lg bg-(--surface) p-4"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="type-meta">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-normal text-(--ink) break-all">
                      {item.value || '—'}
                    </p>
                  </section>
                </header>
              </li>
            ))}

            <li className="rounded-lg bg-(--surface) p-4 sm:col-span-2">
              <header className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileLines} />
                </span>
                <section>
                  <p className="type-meta">
                    Description
                  </p>
                  <p className="mt-1 text-sm font-normal text-(--ink)">
                    {payment.description || 'No description provided.'}
                  </p>
                </section>
              </header>
            </li>
          </ul>
        </InternalSectionCard>

        <InternalSectionCard
          eyebrow="Customer & Entity Context"
          title="Related Information"
        >
          <section className="mt-6 flex flex-col gap-4">
            {[
              { label: 'Customer Name', value: payment.customerName, icon: faUser },
              { label: 'Customer Email', value: payment.customerEmail, icon: faEnvelope },
              { label: 'Customer Phone', value: payment.customerPhone, icon: faPhone },
              { label: 'Created By', value: payment.createdBy?.email, icon: faUserGear },
              {
                label: 'Contact Via',
                value:
                  payment.type === PaymentType.ORDER
                    ? isFetchingOrder
                      ? 'Loading order…'
                      : linkedOrder?.preferredContactMethod
                        ? PREFERRED_CONTACT_METHOD_LABELS[
                            linkedOrder.preferredContactMethod
                          ]
                        : 'Not set'
                    : 'N/A',
                icon: faComments,
              },
              {
                label: 'Linked Order Ref',
                value: payment.type === PaymentType.ORDER
                  ? isFetchingOrder ? 'Loading order…' : linkedOrder?.referenceId || 'Order not found'
                  : 'N/A',
                icon: faTruckFast,
              },
              {
                label: 'Linked Order Status',
                value: payment.type === PaymentType.ORDER
                  ? isFetchingOrder ? 'Loading order…' : linkedOrder?.status || '—'
                  : 'N/A',
                icon: faCircleCheck,
              },
              {
                label: 'Linked Order OTP',
                value: payment.type === PaymentType.ORDER
                  ? isFetchingOrder ? 'Loading order…' : linkedOrder?.trackingId || '—'
                  : 'N/A',
                icon: faHashtag,
              },
              { label: 'Updated At', value: formatDateLabel(payment.updatedAt), icon: faCalendarDay },
            ].map((item) => (
              <article
                key={item.label}
                className="flex items-start gap-3 rounded-lg bg-(--surface) px-4 py-3"
              >
                <span className="mt-0.5 h-8 w-8 rounded-full border border-(--line) bg-(--paper) text-(--ink) flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <section>
                  <p className="type-meta">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-normal text-(--ink) break-all">
                    {item.value || '—'}
                  </p>
                </section>
              </article>
            ))}
          </section>
        </InternalSectionCard>
      </motion.section>

      <motion.menu
        variants={itemVariants}
        className="w-full flex items-center gap-3 justify-between pb-6"
      >
        <Button
          type="button"
          onClick={(e) => { e.preventDefault(); navigate(-1); }}
        >
          Back
        </Button>
      </motion.menu>
    </InternalPage>
  );
};

export default PaymentDetailsPage;
