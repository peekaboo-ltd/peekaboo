import { useLazyFetchPublicOrderActivitiesQuery, useLazyFetchOrderActivitiesQuery } from '@/api/queries/orderActivity.queries';
import { useAppDispatch } from '@/states/hooks';
import { setOrderActivitiesList } from '@/states/slices/orderActivity.slice';
import { useEffect } from 'react';

export const useFetchPublicOrderActivities = () => {
  const dispatch = useAppDispatch();

  const [fetchPublicOrderActivities, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchPublicOrderActivitiesQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrderActivitiesList(data?.data?.rows));
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  return { fetchPublicOrderActivities, data, error, isFetching, reset, isSuccess };
};

export const useFetchOrderActivities = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const [fetchOrderActivities, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchOrderActivitiesQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrderActivitiesList(data?.data?.rows));
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  return { fetchOrderActivities, data, error, isFetching, reset, isSuccess };
};
