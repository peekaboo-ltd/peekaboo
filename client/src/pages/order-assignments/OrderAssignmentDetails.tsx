import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import { useAppSelector } from '@/states/hooks';
import { UUID } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
import { useI18n, type Language } from '@/i18n/i18n';

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const formatDateLabel = (value: string | Date | undefined, language: Language) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(language === 'fr' ? 'fr-RW' : language === 'rw' ? 'rw-RW' : 'en-RW', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderAssignmentDetails = () => {
  const { t, language } = useI18n();
  const { orderAssignment } = useAppSelector((state) => state.orderAssignment);
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle(t('assignments.detailsDocTitle'));

  const { getOrderAssignment, isFetching } = useGetOrderAssignment();

  useEffect(() => {
    if (id) {
      getOrderAssignment({ id: id as UUID });
    }
  }, [id, getOrderAssignment]);

  if (isFetching && !orderAssignment) {
    return (
      <main className="w-full flex items-center justify-center py-16 min-h-screen">
        <p className="text-sm text-(--muted)">{t('assignments.loading')}</p>
      </main>
    );
  }

  if (!orderAssignment) {
    return (
      <main className="w-full flex flex-col gap-4 py-8 min-h-screen px-4">
        <p className="text-sm text-(--muted)">{t('assignments.notFound')}</p>
        <menu className="w-full flex items-center gap-3">
          <Button type="button" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
            {t('common.actions.back')}
          </Button>
        </menu>
      </main>
    );
  }

  const createdByLabel =
    orderAssignment?.createdBy?.name ||
    orderAssignment?.createdBy?.phoneNumber ||
    t('assignments.system');

  const assignedToLabel =
    orderAssignment?.assignedTo?.name ||
    orderAssignment?.assignedTo?.phoneNumber ||
    t('assignments.unassigned');

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
      label: t('assignments.status'),
      value: orderAssignment?.status ? t(`status.${orderAssignment.status.toLowerCase()}`) : '—',
      icon: faCircleCheck,
      iconBg: 'bg-(--surface) text-(--muted)',
    },
    {
      label: t('common.status'),
      value: orderAssignment?.order?.status ? t(`status.${orderAssignment.order.status.toLowerCase()}`) : '—',
      icon: faTruckFast,
      iconBg: 'bg-(--ink) text-(--paper)',
    },
    {
      label: t('assignments.lastUpdated'),
      value: formatDateLabel(orderAssignment?.updatedAt, language),
      icon: faClockRotateLeft,
      iconBg: 'bg-(--surface) text-(--muted)',
    },
  ];

  return (
    <InternalPage>
      <motion.section
        variants={itemVariants}
      >
        <InternalPageHeader
          eyebrow={t('assignments.overview')}
          title={orderAssignment?.order?.referenceId || t('assignments.fallbackTitle')}
          description={t('assignments.overviewDescription')}
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
          eyebrow={t('assignments.details')}
          title={t('assignments.core')}
          actions={
            <span className="type-meta">
              {t('assignments.created', { date: formatDateLabel(orderAssignment.createdAt, language) })}
            </span>
          }
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: t('assignments.orderId'), value: orderAssignment?.order?.referenceId, icon: faHashtag },
              { label: t('assignments.assignedRider'), value: assignedToLabel, icon: faUserGear },
              { label: t('assignments.assignedBy'), value: createdByLabel, icon: faUserGear },
              { label: t('assignments.sender'), value: senderLabel, icon: faPhone },
              { label: t('assignments.recipient'), value: recipientLabel, icon: faPhone },
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
                  <FontAwesomeIcon icon={faLocationDot} />
                </span>
                <section>
                  <p className="type-meta">
                    {t('assignments.deliveryNotes')}
                  </p>
                  <p className="mt-1 text-sm font-normal text-(--ink)">
                    {orderAssignment?.order?.notes || t('assignments.noNotes')}
                  </p>
                </section>
              </header>
            </li>
          </ul>
        </InternalSectionCard>

        <InternalSectionCard
          eyebrow={t('assignments.orderContext')}
          title={t('assignments.metadata')}
        >
          <section className="flex flex-col gap-4">
            {[
              { label: t('assignments.orderReference'), value: orderAssignment?.order?.referenceId, icon: faHashtag },
              { label: t('common.status'), value: orderAssignment?.order?.status ? t(`status.${orderAssignment.order.status.toLowerCase()}`) : undefined, icon: faTruckFast },
              { label: t('assignments.initialFee'), value: orderAssignment?.order?.initialFee, icon: faCircleCheck },
              { label: t('assignments.description'), value: orderAssignment?.description || orderAssignment?.order?.description, icon: faFileLines },
              { label: t('assignments.updated'), value: formatDateLabel(orderAssignment?.updatedAt, language), icon: faCalendarDay },
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
        className="w-full flex items-center gap-3"
      >
        <Button type="button" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
          {t('common.actions.back')}
        </Button>
      </motion.menu>
    </InternalPage>
  );
};

export default OrderAssignmentDetails;
