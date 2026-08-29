import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import Input from '@/components/inputs/Input';
import type { BusinessPlan } from '@/types/businessPlan.type';
import {
  formatCurrency,
  getPricingRows,
  periodNoun,
  quoteForVolume,
} from './plan-pricing';
import { useI18n } from '@/i18n/i18n';

/**
 * The one calculation a buyer comes to this page to do.
 *
 * These plans are priced in volume bands, so the published price list only
 * answers the question indirectly — the reader had to find their own band and
 * do the division in their head. Here they state their volume and the ladder
 * answers: which band they land in, what it costs, and what that works out to
 * per delivery.
 */
const PlanVolumeCalculator = ({ plan }: { plan: BusinessPlan }) => {
  const { t } = useI18n();
  const rows = useMemo(() => getPricingRows(plan, t), [plan, t]);
  const unit = periodNoun(plan.billingPeriod, t);

  // Seeded at the top of the first band, so the ladder arrives already
  // answering rather than showing an empty state.
  const firstQuotable = rows.find((row) => !row.isCustom);
  const seed =
    firstQuotable?.tier.maxQuantity ?? firstQuotable?.tier.minQuantity ?? 0;

  const [value, setValue] = useState(seed ? String(seed) : '');
  const volume = Number(value);
  const quote = useMemo(() => quoteForVolume(plan, volume, t), [plan, t, volume]);

  if (!rows.length) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start">
      <div>
        <Input
          id="plan-volume"
          type="number"
          min={0}
          label={t('pricing.deliveriesInput', { unit })}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('pricing.volumePlaceholder')}
          description={t('pricing.volumeDescription')}
        />

        <div className="card-quiet mt-4 p-4">
          {quote.total != null ? (
            <>
              <p className="type-eyebrow">{t('pricing.yourCost')}</p>
              <p className="type-price mt-2 text-(--ink)">
                {Number(quote.total).toLocaleString()}
                <span className="type-label ml-1.5 text-(--muted)">
                  {quote.currency}
                </span>
              </p>
              <p className="type-meta mt-1">{t('pricing.perUnit', { unit })}</p>
              {quote.perDelivery ? (
                <p className="type-body-sm mt-3 border-t border-(--line) pt-3">
                  <span className="tabular font-medium">
                    {formatCurrency(quote.perDelivery, quote.currency)}
                  </span>{' '}
                  <span className="text-(--muted)">{t('pricing.perDelivery')}</span>
                </p>
              ) : null}
              {quote.overflowCount > 0 ? (
                <p className="type-meta mt-2">
                  {t('pricing.overflow', {
                    count: quote.overflowCount,
                    amount: formatCurrency(quote.overflowTotal / quote.overflowCount, quote.currency),
                  })}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="type-eyebrow">{t('pricing.yourCost')}</p>
              <p className="type-body-sm mt-2 text-(--muted)">{quote.note}</p>
            </>
          )}
        </div>
      </div>

      {/* The ladder. The band the volume lands in inverts, which is the same
          selection language the rest of the app uses for a chosen option. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] border-collapse text-left">
          <caption className="sr-only">
            {t('pricing.tableCaption', { plan: plan.name, unit })}
          </caption>
          <thead>
            <tr className="border-b border-(--line)">
              <th scope="col" className="type-eyebrow pb-2 pr-4 font-medium">
                {t('pricing.deliveriesInput', { unit })}
              </th>
              <th scope="col" className="type-eyebrow pb-2 pr-4 font-medium">
                {t('pricing.price')}
              </th>
              <th scope="col" className="type-eyebrow pb-2 text-right font-medium">
                {t('pricing.perDelivery')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isMatch = quote.row?.key === row.key;
              return (
                <tr
                  key={row.key}
                  data-selected={isMatch || undefined}
                  className={cn(
                    'border-b border-(--line) last:border-b-0',
                    // data-selected is the app-wide inversion rule; it paints
                    // ink-on-paper without this row restating the colors.
                    !isMatch && 'text-(--ink)',
                  )}
                >
                  <th
                    scope="row"
                    className="tabular type-body-sm py-3 pr-4 pl-2 font-normal"
                  >
                    {row.range}
                    {isMatch ? (
                      <span className="ml-2 text-[0.6875rem] uppercase opacity-80">
                        {t('pricing.you')}
                      </span>
                    ) : null}
                  </th>
                  <td className="tabular type-body-sm py-3 pr-4 font-medium">
                    {row.priceLabel}
                  </td>
                  <td
                    className={cn(
                      'tabular type-body-sm py-3 pr-2 text-right',
                      !isMatch && 'text-(--muted)',
                    )}
                  >
                    {row.perDeliveryLabel ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {plan.pricingTiers?.overflowRate ? (
          <p className="type-meta mt-3">
            {t('pricing.aboveTopBand', { amount: formatCurrency(plan.pricingTiers.overflowRate, plan.currency) })}
          </p>
        ) : null}
        {plan.pricingTiers?.fallbackRate ? (
          <p className="type-meta mt-1">
            {t('pricing.belowThreshold', { amount: formatCurrency(plan.pricingTiers.fallbackRate, plan.currency) })}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default PlanVolumeCalculator;
