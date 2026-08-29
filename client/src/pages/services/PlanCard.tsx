import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/types/businessPlan.type';
import {
  getPricingRows,
  periodNoun,
  resolvePrice,
  type PriceParts,
} from './plan-pricing';
import Button from '@/components/inputs/Button';
import { useI18n } from '@/i18n/i18n';

/**
 * The price lockup. The numeral is set at display size and its currency and
 * cadence sit small beside it on a shared baseline, so a column of cards lines
 * its prices up no matter how long each plan's words are.
 */
export const PriceLockup = ({
  price,
  className,
}: {
  price: PriceParts;
  className?: string;
}) => {
  const { t } = useI18n();
  if (!price.amount) {
    return (
      // Matches the priced lockup's height so the bands and features below it
      // start on the same line as the cards beside it.
      <p className={cn('flex min-h-[3.25rem] flex-col justify-center', className)}>
        <span className="type-h3 text-(--ink)">{t('pricing.custom')}</span>
        <span className="type-meta">{price.note ?? t('pricing.contact')}</span>
      </p>
    );
  }

  return (
    <div className={cn("flex min-h-[3.25rem] flex-col justify-center", className)}>
      <div className="flex items-end gap-x-1 flex-wrap">
        {price.isFrom ? (
          <span className="type-meta shrink-0 mr-1">{t('pricing.from')}</span>
        ) : null}
        <span className="type-price text-(--ink) leading-none">{price.amount}</span>
        <span className="type-label text-(--muted) mb-[2px]">{price.currency}</span>
      </div>
      {price.cadence ? (
        <span className="type-meta mt-1 block">{price.cadence}</span>
      ) : null}
    </div>
  );
};

/**
 * One plan, as a card.
 *
 * The card leads with the price, then shows the first few volume bands — the
 * bands are the product, and flattening them to a single "from" line hid the
 * one thing a buyer is shopping for. It carries a single action: cards used to
 * stack two full-width buttons each, which put six competing CTAs in a
 * three-card row, and the primary one said the same thing on every card.
 */
const PlanCard = ({
  plan,
  recommendedLabel,
  ctaLabel,
  maxBands = 3,
}: {
  plan: BusinessPlan;
  recommendedLabel?: string;
  ctaLabel?: string;
  maxBands?: number;
}) => {
  const { t } = useI18n();
  const price = resolvePrice(plan, t);
  const rows = getPricingRows(plan, t);
  const isRecommended = Boolean(plan.badge) || plan.isDefault;
  const to = `/services/${plan.slug}`;
  const shownBands = rows.slice(0, maxBands);
  const remainingBands = rows.length - shownBands.length;

  return (
    <article
      className={cn(
        'card-framed relative flex h-full flex-col',
        // The recommended plan is distinguished by the weight of its edge, in
        // the same ink-ring idiom the focused controls use. It used to be the
        // only white card among grey ones, which made the plan being
        // recommended the most recessive thing on the row.
        isRecommended &&
          'border-(--ink) shadow-[var(--ink)_0_0_0_1px_inset]',
      )}
    >
      {isRecommended ? (
        <span className="absolute -top-2.5 left-5 inline-flex h-5 items-center rounded-(--radius-pill) bg-(--ink) px-2.5 text-[0.6875rem] font-medium tracking-wide text-(--paper) uppercase">
          {plan.badge || recommendedLabel || t('plans.mostPopular')}
        </span>
      ) : null}

      <section className="flex flex-1 flex-col p-6">
        <h3 className="type-card-title">{plan.name}</h3>
        <p className="type-meta mt-1.5 min-h-[2.25rem]">
          {plan.description || t('pricing.flexibleDescription')}
        </p>

        <PriceLockup price={price} className="mt-5" />

        {shownBands.length ? (
          <div className="mt-5 border-t border-(--line) pt-4">
            <p className="type-eyebrow">
              {t('pricing.bandsPer', { unit: periodNoun(plan.billingPeriod, t) })}
            </p>
            <dl className="mt-3 space-y-2">
              {shownBands.map((row) => (
                <div
                  key={row.key}
                  className="flex items-baseline justify-between gap-3"
                >
                  <dt className="tabular type-body-sm shrink-0 text-(--muted)">
                    {row.range}
                  </dt>
                  <span
                    aria-hidden="true"
                    className="min-w-4 flex-1 translate-y-[-0.2em] border-b border border-(--line)"
                  />
                  <dd className="tabular type-body-sm shrink-0 font-medium text-(--ink)">
                    {row.priceLabel}
                  </dd>
                </div>
              ))}
            </dl>
            {remainingBands > 0 ? (
              <p className="type-meta mt-2">
                {t(remainingBands === 1 ? 'pricing.moreBand' : 'pricing.moreBands', { count: remainingBands })}
              </p>
            ) : null}
          </div>
        ) : null}

        {plan.features?.length ? (
          <ul className="mt-5 flex-1 space-y-2 border-t border-(--line) pt-4">
            {plan.features.slice(0, 5).map((feature) => (
              <li key={feature} className="type-body-sm flex items-start gap-2">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="mt-1 size-3.5 shrink-0 text-(--ink)"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-1" />
        )}

        <Button route={to} variant="secondary" className="mt-6 w-full">
          {ctaLabel ?? t('plans.seePricing')}
        </Button>
      </section>
    </article>
  );
};

export default PlanCard;
