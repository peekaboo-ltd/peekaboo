import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { useGetOrderByReferenceId } from '@/hooks/orders/orders.hooks';
import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const TrackOrder = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  useDocumentTitle('Track Order');

  const [referenceId, setReferenceId] = useState(initialRef);
  const [errorMessage, setErrorMessage] = useState('');

  const { getOrderByReferenceId, isFetching, isSuccess, isError, data, reset } = useGetOrderByReferenceId();

  // Auto-search if ref parameter is provided
  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSuccess && data?.data?.id) {
      navigate(`/p/orders/${data.data.id}`);
      reset();
    }
  }, [isSuccess, data, navigate, reset]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(t('trackOrder.notFound'));
    }
  }, [isError, t]);

  const handleSearch = (refId?: string) => {
    const searchRef = refId || referenceId.trim().toUpperCase();
    if (!searchRef) {
      setErrorMessage(t('trackOrder.enterOrderId'));
      return;
    }
    setErrorMessage('');
    getOrderByReferenceId({ referenceId: searchRef });
  };

  return (
    <main className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <article className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <header className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faBoxOpen} className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('trackOrder.title')}
          </h1>
          <p className="text-gray-600 text-sm">
            {t('trackOrder.subtitle')}
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="reference-id" className="block text-sm font-medium text-gray-700 mb-2">
              {t('trackOrder.orderIdLabel')}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <Input
                id="reference-id"
                value={referenceId}
                onChange={(e) => {
                  setReferenceId(e.target.value.toUpperCase());
                  setErrorMessage('');
                }}
                placeholder={t('trackOrder.orderIdPlaceholder')}
                className="pl-10 uppercase"
                autoComplete="off"
                autoFocus
              />
            </div>
            {errorMessage && (
              <p className="mt-2 text-sm text-black">{errorMessage}</p>
            )}
          </div>

          <Button
            type="submit"
            primary
            isLoading={isFetching}
            className="w-full py-3!"
          >
            {t('trackOrder.searchButton')}
          </Button>
        </form>

        <footer className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {t('trackOrder.hint')}
          </p>
        </footer>
      </article>
    </main>
  );
};

export default TrackOrder;
