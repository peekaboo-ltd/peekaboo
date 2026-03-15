import { useLazyFetchOrganizationMembersQuery } from "@/api/queries/organization.queries";
import { useAppDispatch } from "@/states/hooks";
import { OrganizationMembership } from "@/types/organizationMembership.types";
import { useEffect, useState } from "react";
import { usePagination } from "../common/pagination.hooks";

export const useFetchOrganizationMembers = () => {

    const dispatch = useAppDispatch();
    const [organizationMembersList, setOrganizationMembersList] = useState<OrganizationMembership[]>([]);

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

    const [fetchOrganizationMembers, { data, isFetching, isSuccess }] = useLazyFetchOrganizationMembersQuery();

    useEffect(() => {
        if (isSuccess && data) {
            setOrganizationMembersList(data?.data?.rows);
            setTotalPages(data?.data?.totalPages);
            setTotalCount(data?.data?.totalCount);
        }
    }, [data, dispatch, setTotalPages, setTotalCount, isSuccess]);

    return { fetchOrganizationMembers, organizationMembersList, isFetching, page, setPage, size, setSize, totalPages, totalCount };
};
