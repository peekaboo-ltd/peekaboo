import Button from '@/components/inputs/Button';
import { ORDER_FEE_RANGES } from '@/constants/order.constants';
import { formatCurrency } from '@/utils/strings.util';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useI18n } from '@/i18n/i18n';

const OrderFees = () => {
  // NAVIGATION
  const navigate = useNavigate();
  const { t } = useI18n();
  useDocumentTitle(t('fees.docTitle'));

  return (
    <main className="min-h-screen bg-(--paper) text-(--ink)">
      <section className="border-b border-(--line) py-16">
        <article className="app-container">
          <p className="text-sm font-normal text-(--muted)">
            {t('fees.eyebrow')}
          </p>
          <h1 className="mt-3 type-h2">
            {t('fees.title')}
          </h1>
          <p className="type-body mt-3 max-w-[68ch] text-(--muted)">
            {t('fees.description')}
          </p>
        </article>
      </section>

      <section className="section-rhythm">
        <article className="app-container">
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="type-h3 text-(--ink)">
                {t('fees.distancePricing')}
              </h2>
              <p className="mt-2 text-sm font-normal text-(--muted)">
                {t('fees.vatDescription')}
              </p>
            </div>
          </header>

          <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <article className="lg:col-span-2 overflow-hidden rounded-md border border-(--line) bg-(--paper)">
              <header className="px-6 py-5 border-b border-(--line)">
                <h3 className="type-card-title">
                  {t('fees.ranges')}
                </h3>
              </header>
              <div className="divide-y divide-(--line)">
                {ORDER_FEE_RANGES.map((range) => {
                  const rangeLabel =
                    range.max === Infinity
                      ? t('fees.rangeAbove', { min: range.min })
                      : t('fees.rangeBetween', { min: range.min, max: range.max });

                  return (
                    <div
                      key={`${range.min}-${range.max}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 gap-2"
                    >
                      <div>
                        <p className="text-sm text-(--muted)">{t('fees.distance')}</p>
                        <p className="text-sm font-normal text-(--ink)">
                          {rangeLabel}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-(--muted)">{t('fees.fee')}</p>
                        <p className="text-base font-normal text-(--ink)">
                          {formatCurrency(range.fee, 'RWF')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <aside className="space-y-4 rounded-md border border-(--line) bg-(--paper) p-6">
              <h3 className="type-card-title">
                {t('fees.calculationTitle')}
              </h3>
              <p className="text-sm text-(--muted)">
                {t('fees.calculationP1')}
              </p>
              <p className="text-sm text-(--muted)">
                {t('fees.calculationP2')}
              </p>
              <Button
                route="/track"
                className="w-full"
                primary
              >
                {t('fees.track')}
              </Button>
            </aside>
            <div className="lg:col-span-3 flex flex-wrap gap-3">
              <Button
                route="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
                className="w-fit"
              >
                {t('fees.back')}
              </Button>
            </div>
          </section>
        </article>
      </section>
    </main>
  );
};

export default OrderFees;
