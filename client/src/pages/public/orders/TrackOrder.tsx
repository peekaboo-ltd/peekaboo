import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/inputs/Button';
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
    <PublicPage className="min-h-fit">
      <PublicPageHero
        eyebrow={t('trackOrder.eyebrow')}
        title={t('trackOrder.title')}
        description={t('trackOrder.subtitle')}
      />

      <PublicSectionCard className="mx-auto w-full max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col"
        >
          {/* Label, icon, hint, and error are all the field's own slots. Hand
              -positioning the icon over the control centred it on the whole
              stack, so it slid down as soon as an error appeared below. */}
          <Input
            id="reference-id"
            label={t('trackOrder.orderIdLabel')}
            value={referenceId}
            onChange={(e) => {
              setReferenceId(e.target.value.toUpperCase());
              setErrorMessage('');
            }}
            placeholder={t('trackOrder.orderIdPlaceholder')}
            prefixIcon={faMagnifyingGlass}
            description={t('trackOrder.hint')}
            errorMessage={errorMessage}
          />

          <Button
            type="submit"
            primary
            isLoading={isFetching}
            className="mt-5 self-end"
          >
            {t('trackOrder.searchButton')}
          </Button>
        </form>
      </PublicSectionCard>
    </PublicPage>
  );
};

export default TrackOrder;
