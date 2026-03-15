import Table from '@/components/table/Table';
import { useOrganizationMembersColumns } from '@/hooks/organization/columns.organization';
import { useFetchOrganizationMembers } from '@/hooks/organization/organizationMembers.hooks';
import { UUID } from '@/types';
import { useEffect } from 'react'

export interface OrganizationMembersProps {
    organizationId?: UUID;
}

const OrganizationMembers = ({ organizationId }: OrganizationMembersProps) => {

    // STATE VARIABLES

    const { fetchOrganizationMembers, isFetching: organizationMembersIsFetching, organizationMembersList, page, setPage, size, setSize, totalPages, totalCount } = useFetchOrganizationMembers();

    const { organizationMembersColumns } = useOrganizationMembersColumns();

    // FETCH ORGANIZATION MEMBERS
    useEffect(() => {
        if (organizationId) {
            fetchOrganizationMembers({ id: organizationId, page, size });
        }
    }, [organizationId, page, size, fetchOrganizationMembers]);

    return (
        <>
            <Table
                columns={organizationMembersColumns}
                data={organizationMembersList}
                showPagination={true}
                page={page}
                setPage={setPage}
                isLoading={organizationMembersIsFetching}
                size={size}
                totalCount={totalCount}
                totalPages={totalPages}
                setSize={setSize}
            />
        </>
    )
}

export default OrganizationMembers;
