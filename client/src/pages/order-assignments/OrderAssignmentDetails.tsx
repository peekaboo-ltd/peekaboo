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
      <main className="w-full flex items-center justify-center py-16 bg-[#FAFAF7] min-h-screen">
        <p className="text-sm text-slate-500">Loading assignment details…</p>
      </main>
    );
  }

  if (!orderAssignment) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 bg-[#FAFAF7] min-h-screen px-4">
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
    <motion.main
      className="relative w-full flex flex-col gap-6 min-h-screen bg-[#FAFAF7]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative blur blobs */}
      <figure
        className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-secondary-200/30 blur-3xl"
        aria-hidden="true"
      />
      <figure
        className="pointer-events-none absolute -left-32 bottom-20 h-[360px] w-[360px] rounded-full bg-primary-200/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Header card */}
      <motion.section
        className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        variants={itemVariants}
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary-200/40 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-primary-200/30 blur-3xl" />

        <header className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <section className="flex items-center gap-5">
            <figure className="h-16 w-16 rounded-2xl bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-900 text-white flex items-center justify-center text-2xl shadow-lg">
              <FontAwesomeIcon icon={faAddressCard} />
            </figure>
            <section>
              <p className="text-xs uppercase tracking-[0.28em] text-secondary-700 font-medium">
                Assignment Overview
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#25343F] sm:text-3xl">
                {orderAssignment?.order?.referenceId || 'Order Assignment'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Rider assignment details, ownership, and order context.
              </p>
            </section>
          </section>
        </header>
      </motion.section>

      {/* Stats */}
      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <header className="flex items-center justify-between">
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-md font-semibold text-[#25343F]">
                  {stat.value}
                </p>
              </section>
              <span className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                <FontAwesomeIcon icon={stat.icon} />
              </span>
            </header>
          </article>
        ))}
      </motion.section>

      {/* Details */}
      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={itemVariants}
      >
        <article className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary-700 font-medium">
                Assignment Details
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#25343F]">
                Core Information
              </h2>
            </section>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Created {formatDateLabel(orderAssignment.createdAt)}
            </span>
          </header>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Order ID', value: orderAssignment?.order?.referenceId, icon: faHashtag },
              { label: 'Assigned Rider', value: assignedToLabel, icon: faUserGear },
              { label: 'Assigned By', value: createdByLabel, icon: faUserGear },
              { label: 'Sender', value: senderLabel, icon: faPhone },
              { label: 'Recipient', value: recipientLabel, icon: faPhone },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <header className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-secondary-50 text-secondary-800 shadow-sm flex items-center justify-center">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <section>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#25343F] break-all">
                      {item.value || '—'}
                    </p>
                  </section>
                </header>
              </li>
            ))}

            <li className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:col-span-2">
              <header className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-lg bg-secondary-50 text-secondary-800 shadow-sm flex items-center justify-center">
                  <FontAwesomeIcon icon={faLocationDot} />
                </span>
                <section>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Delivery Notes / Destination
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#25343F]">
                    {orderAssignment?.order?.notes || 'No destination notes available.'}
                  </p>
                </section>
              </header>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-700 font-medium">
              Order Context
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#25343F]">
              Assignment Metadata
            </h2>
          </header>

          <section className="mt-6 flex flex-col gap-4">
            {[
              { label: 'Order Reference', value: orderAssignment?.order?.referenceId, icon: faHashtag },
              { label: 'Order Status', value: orderAssignment?.order?.status, icon: faTruckFast },
              { label: 'Initial Fee', value: orderAssignment?.order?.initialFee, icon: faCircleCheck },
              { label: 'Description', value: orderAssignment?.description || orderAssignment?.order?.description, icon: faFileLines },
              { label: 'Assignment Updated', value: formatDateLabel(orderAssignment?.updatedAt), icon: faCalendarDay },
            ].map((item) => (
              <article
                key={item.label}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
              >
                <span className="mt-0.5 h-8 w-8 rounded-lg bg-secondary-50 text-secondary-800 shadow-sm flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <section>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#25343F] break-all">
                    {item.value || '—'}
                  </p>
                </section>
              </article>
            ))}
          </section>
        </article>

        <menu className="flex items-center gap-3 justify-between pb-6">
          <Button type="button" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
            Back
          </Button>
        </menu>
      </motion.section>
    </motion.main>
  );
};

export default OrderAssignmentDetails;
