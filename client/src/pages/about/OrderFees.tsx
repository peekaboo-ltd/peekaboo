import Button from '@/components/inputs/Button';
import { ORDER_FEE_RANGES } from '@/constants/order.constants';
import { formatCurrency } from '@/utils/strings.util';
import { Link, useNavigate } from 'react-router-dom';

const OrderFees = () => {
  // NAVIGATION
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-primary-900 text-white py-16">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-primary-200">
            Transparent Pricing
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">
            Order Fee Breakdown
          </h1>
          <p className="text-base sm:text-lg text-primary-100 mt-4 max-w-3xl">
            Fees are calculated from the distance between pickup and delivery.
            The table below shows the fee range we apply per order.
          </p>
        </article>
      </section>

      <section className="py-12 lg:py-16">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Distance-Based Pricing
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Prices are quoted in RWF and include VAT.
              </p>
            </div>
          </header>

          <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <article className="lg:col-span-2 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
              <header className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fee Ranges
                </h3>
              </header>
              <div className="divide-y divide-gray-100">
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
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="text-base font-semibold text-gray-900">
                          {rangeLabel}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-500">Fee</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(range.fee)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <aside className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                How We Calculate
              </h3>
              <p className="text-sm text-gray-600">
                We use the road distance between pickup and delivery locations.
                Once both locations are set, we calculate the distance and apply
                the matching fee range above.
              </p>
              <p className="text-sm text-gray-600">
                The fee is displayed before you complete payment, so you always
                know the cost upfront.
              </p>
              <Link
                to="/track"
                className="inline-flex items-center justify-center w-full rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
              >
                Track an Order
              </Link>
            </aside>
            <Button
              route="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              primary
              className='w-fit'
            >
              Back
            </Button>
          </section>
        </article>
      </section>
    </main>
  );
};

export default OrderFees;
