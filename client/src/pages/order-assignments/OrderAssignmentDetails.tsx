import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import { useAppSelector } from '@/states/hooks';
import { UUID } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAddressCard,
  faCalendarDay,
  faCircleCheck,
  faHashtag,
  faLocationDot,
  faPhone,
  faTruckFast,
  faUserGear,
  faClockRotateLeft,
  faFileLines,
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
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderAssignmentDetails = () => {
  const { orderAssignment } = useAppSelector((state) => state.orderAssignment);
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle('Assignment details');

  const { getOrderAssignment, isFetching } = useGetOrderAssignment();

  useEffect(() => {
    if (id) {
      getOrderAssignment({ id: id as UUID });
    }
  }, [id, getOrderAssignment]);

  if (isFetching && !orderAssignment) {
    return (
      <main className="w-full flex items-center justify-center py-16 min-h-screen">
        <p className="text-sm text-slate-500">Loading assignment details…</p>
      </main>
    );
  }

  if (!orderAssignment) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 min-h-screen px-4">
        <p className="text-sm text-slate-500">Assignment not found.</p>
        <menu className="w-full flex items-center gap-3">
          <Button type="button" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
            Back
          </Button>
        </menu>
      </main>
    );
  }

  const createdByLabel =
    orderAssignment?.createdBy?.name ||
    orderAssignment?.createdBy?.phoneNumber ||
    'System';

  const assignedToLabel =
    orderAssignment?.assignedTo?.name ||
    orderAssignment?.assignedTo?.phoneNumber ||
    'Unassigned';

  const recipientLabel =
    orderAssignment?.order?.recipient?.name ||
    orderAssignment?.order?.recipient?.phoneNumber ||
    '—';

  const senderLabel =
    orderAssignment?.order?.sender?.name ||
    orderAssignment?.order?.sender?.phoneNumber ||
    '—';

  const stats = [
    {
      label: 'Assignment Status',
      value: orderAssignment?.status || '—',
      icon: faCircleCheck,
      iconBg: 'bg-secondary-50 text-secondary-800',
    },
    {
      label: 'Order Status',
      value: orderAssignment?.order?.status || '—',
      icon: faTruckFast,
      iconBg: 'bg-primary-50 text-primary-900',
    },
    {
      label: 'Last Updated',
      value: formatDateLabel(orderAssignment?.updatedAt),
      icon: faClockRotateLeft,
      iconBg: 'bg-secondary-50 text-secondary-800',
    },
  ];

  return (
    <InternalPage>
      <motion.section
        variants={itemVariants}
      >
        <InternalPageHeader
          eyebrow="Assignment Overview"
          title={orderAssignment?.order?.referenceId || 'Order Assignment'}
          description="Rider assignment details, ownership, and order context."
        />
      </motion.section>

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

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <InternalSectionCard
          className="lg:col-span-2"
          eyebrow="Assignment Details"
          title="Core Information"
          actions={
            <span className="text-xs uppercase text-slate-400">
              Created {formatDateLabel(orderAssignment.createdAt)}
            </span>
          }
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Order ID', value: orderAssignment?.order?.referenceId, icon: faHashtag },
              { label: 'Assigned Rider', value: assignedToLabel, icon: faUserGear },
              { label: 'Assigned By', value: createdByLabel, icon: faUserGear },
              { label: 'Sender', value: senderLabel, icon: faPhone },
              { label: 'Recipient', value: recipientLabel, icon: faPhone },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="text-xs uppercase text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#25343F] break-all">
                      {item.value || '—'}
                    </p>
                  </section>
                </header>
              </li>
            ))}

            <li className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <header className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLocationDot} />
                </span>
                <section>
                  <p className="text-xs uppercase text-slate-400">
                    Delivery Notes / Destination
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#25343F]">
                    {orderAssignment?.order?.notes || 'No destination notes available.'}
                  </p>
                </section>
              </header>
            </li>
          </ul>
        </InternalSectionCard>

        <InternalSectionCard
          eyebrow="Order Context"
          title="Assignment Metadata"
        >
          <section className="flex flex-col gap-4">
            {[
              { label: 'Order Reference', value: orderAssignment?.order?.referenceId, icon: faHashtag },
              { label: 'Order Status', value: orderAssignment?.order?.status, icon: faTruckFast },
              { label: 'Initial Fee', value: orderAssignment?.order?.initialFee, icon: faCircleCheck },
              { label: 'Description', value: orderAssignment?.description || orderAssignment?.order?.description, icon: faFileLines },
              { label: 'Assignment Updated', value: formatDateLabel(orderAssignment?.updatedAt), icon: faCalendarDay },
            ].map((item) => (
              <article
                key={item.label}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="mt-0.5 h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <section>
                  <p className="text-xs uppercase text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#25343F] break-all">
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
        className="w-full flex items-center gap-3"
      >
        <Button type="button" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
          Back
        </Button>
      </motion.menu>
    </InternalPage>
  );
};

export default OrderAssignmentDetails;
