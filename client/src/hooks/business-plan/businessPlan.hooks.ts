import { useLazyFetchBusinessPlansQuery } from "@/api/queries/businessPlan.queries";
import { useAppDispatch } from "@/states/hooks";
import { usePagination } from "../common/pagination.hooks";
import { useEffect } from "react";
import { setBusinessPlansList } from "@/states/slices/businessPlan.slice";

export const useFetchBusinessPlans = () => {

    // STATE VARIABLES
    const dispatch = useAppDispatch();

    const {
        page,
        setPage,
        size,
        setSize,
        totalPages,
        setTotalPages,
        totalCount,
        setTotalCount,
    } = usePagination();

    const [fetchBusinessPlans, { data, isFetching, isSuccess }] = useLazyFetchBusinessPlansQuery();

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setBusinessPlansList(data?.data?.rows));
            setTotalPages(data?.data?.totalPages);
            setTotalCount(data?.data?.totalCount);
        }
    }, [isSuccess, data, dispatch, setTotalPages, setTotalCount]);

    return { fetchBusinessPlans, isFetching, page, setPage, size, setSize, totalPages, setTotalPages, totalCount, setTotalCount };
};
