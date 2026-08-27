import Button from '@/components/inputs/Button';
import { ORDER_FEE_RANGES } from '@/constants/order.constants';
import { formatCurrency } from '@/utils/strings.util';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const OrderFees = () => {
  // NAVIGATION
  const navigate = useNavigate();
  useDocumentTitle('Order Fees');

  return (
    <main className="min-h-screen bg-(--paper) text-(--ink)">
      <section className="border-b border-(--line) py-16">
        <article className="app-container">
          <p className="text-sm font-normal text-(--muted)">
            Transparent Pricing
          </p>
          <h1 className="mt-3 type-h2">
            Order Fee Breakdown
          </h1>
          <p className="type-body mt-3 max-w-[68ch] text-(--muted)">
            Fees are calculated from the distance between pickup and delivery.
            The table below shows the fee range we apply per order.
          </p>
        </article>
      </section>

      <section className="section-rhythm">
        <article className="app-container">
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="type-h3 text-(--ink)">
                Distance-Based Pricing
              </h2>
              <p className="mt-2 text-sm font-normal text-(--muted)">
                Prices are quoted in RWF and include VAT.
              </p>
            </div>
          </header>

          <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <article className="lg:col-span-2 overflow-hidden rounded-md border border-(--line) bg-(--paper)">
              <header className="px-6 py-5 border-b border-(--line)">
                <h3 className="type-card-title">
                  Fee Ranges
                </h3>
              </header>
              <div className="divide-y divide-(--line)">
                {ORDER_FEE_RANGES.map((range) => {
                  const rangeLabel =
                    range.max === Infinity
                      ? `${range.min} km and above`
                      : `${range.min} km - ${range.max} km`;

                  return (
                    <div
                      key={`${range.min}-${range.max}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 gap-2"
                    >
                      <div>
                        <p className="text-sm text-(--muted)">Distance</p>
                        <p className="text-sm font-normal text-(--ink)">
                          {rangeLabel}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-(--muted)">Fee</p>
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
                How We Calculate
              </h3>
              <p className="text-sm text-(--muted)">
                We use the road distance between pickup and delivery locations.
                Once both locations are set, we calculate the distance and apply
                the matching fee range above.
              </p>
              <p className="text-sm text-(--muted)">
                The fee is displayed before you complete payment, so you always
                know the cost upfront.
              </p>
              <Button
                route="/track"
                className="w-full"
                primary
              >
                Track an Order
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
                Back
              </Button>
            </div>
          </section>
        </article>
      </section>
    </main>
  );
};

export default OrderFees;
