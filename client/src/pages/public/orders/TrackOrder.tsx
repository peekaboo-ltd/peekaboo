import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useGetOrderByReferenceId } from '@/hooks/orders/orders.hooks';
import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Input from '@/components/inputs/Input';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
} from '@/components/layout/PublicPage';

const TrackOrder = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  useDocumentTitle('Track Order');

  const [referenceId, setReferenceId] = useState(initialRef);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    getOrderByReferenceId,
    isFetching,
    isSuccess,
    isError,
    data,
    reset,
  } = useGetOrderByReferenceId();

  const handleSearch = useCallback((refId?: string) => {
    const searchRef = refId || referenceId.trim().toUpperCase();
    if (!searchRef) {
      setErrorMessage(t('trackOrder.enterOrderId'));
      return;
    }
    setErrorMessage('');
    getOrderByReferenceId({ referenceId: searchRef });
  }, [referenceId, getOrderByReferenceId, t]);

  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [handleSearch, initialRef]);

  useEffect(() => {
    if (isSuccess && data?.data?.id) {
      navigate(`/p/orders/${data.data.id}/tracking`);
      reset();
    }
  }, [isSuccess, data, navigate, reset]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(t('trackOrder.notFound'));
    }
  }, [isError, t]);

  return (
    <PublicPage className="max-lg:mt-16 min-h-fit">
      <PublicPageHero
        eyebrow={t('trackOrder.eyebrow')}
        title={t('trackOrder.title')}
        description={t('trackOrder.subtitle')}
      />

      <PublicSectionCard
        className="mx-auto w-full border-primary-200"
        title={t('trackOrder.searchButton')}
        description={t('trackOrder.searchDescription')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col gap-4"
        >
          <label
            htmlFor="reference-id"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            {t('trackOrder.orderIdLabel')}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <Input
              id="reference-id"
              value={referenceId}
              onChange={(e) => {
                setReferenceId(e.target.value.toUpperCase());
                setErrorMessage('');
              }}
              placeholder={t('trackOrder.orderIdPlaceholder')}
              className="h-11 rounded-lg border-slate-200 bg-white pl-4 pr-3 uppercase"
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {t('trackOrder.hint')}
          </p>
          {errorMessage ? (
            <p className="mt-2 text-sm text-black">{errorMessage}</p>
          ) : null}

          <Button
            type="submit"
            primary
            isLoading={isFetching}
            className="self-end"
          >
            {t('trackOrder.searchButton')}
          </Button>
        </form>
      </PublicSectionCard>
    </PublicPage>
  );
};

export default TrackOrder;
