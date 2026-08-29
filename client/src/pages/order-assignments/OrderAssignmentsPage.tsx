import Table from "@/components/table/Table";
import { useStatusFilter } from "@/hooks/common/filters.hooks";
import { useOrderAssignmentsColumns } from "@/hooks/orders/columns.orderAssignments";
import { useFetchOrderAssignments } from "@/hooks/orders/orderAssignments.hooks";
import { useAppSelector } from "@/states/hooks";
import { OrderAssignmentStatus } from "@/types/orderAssignment.type";
import { useEffect, useMemo, useState } from "react";
import AcceptOrderAssignment from "./AcceptOrderAssignment";
import RejectOrderAssignment from "./RejectOrderAssignment";
import ReassignOrderAssignment from "./ReassignOrderAssignment";
import { UUID } from "@/types";
import { useDocumentTitle } from "@/hooks/common/useDocumentTitle";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useI18n } from '@/i18n/i18n';

const OrderAssignmentsPage = () => {
  const { t } = useI18n();
  // STATE VARIABLES
  const {
    orderAssignmentsList,
    acceptOrderAssignmentModal,
    rejectOrderAssignmentModal,
    reassignOrderAssignmentModal,
  } = useAppSelector((state) => state.orderAssignment);
  const { user } = useAppSelector((state) => state.auth);
  const [filteredAssignmentStatuses, setFilteredAssignmentStatuses] = useState<
    string[]
  >([]);

  useDocumentTitle(t('assignments.docTitle'));
  const [searchParams, setSearchParams] = useSearchParams();

  const { control: filterControl, setValue: setFilterValue } = useForm();

  const statusOptions = useMemo(() => Object.values(OrderAssignmentStatus), []);

  useEffect(() => {
    if (user?.userRoles?.some((role) => ["RIDER"].includes(role.role.name))) {
      setFilteredAssignmentStatuses([
        OrderAssignmentStatus.ACTIVE,
        OrderAssignmentStatus.PENDING,
      ]);
    } else {
      setFilteredAssignmentStatuses(statusOptions);
    }
  }, [statusOptions, user?.userRoles]);

  const defaultStatuses = useMemo(() => {
    const statusParam = searchParams.get("status");

    if (!statusParam) {
      return [];
    }

    return statusParam
      .split(",")
      .map((status) => status.trim())
      .filter((status) =>
        statusOptions.includes(status as (typeof statusOptions)[number]),
      );
  }, [searchParams, statusOptions]);
  const prioritizeUnassigned = useMemo(() => {
    const prioritizeValue = searchParams.get("prioritizeUnassigned");
    return prioritizeValue === "true" || prioritizeValue === "1";
  }, [searchParams]);

  const { statusFilter, applicationStatus } = useStatusFilter({
    control: filterControl,
    setValue: setFilterValue,
    applicationStatuses: filteredAssignmentStatuses,
    defaultStatuses,
    label: t('assignments.status'),
  });

  // ORDER ASSIGMENT HOOKS
  const {
    fetchOrderAssignments,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
    isFetching,
  } = useFetchOrderAssignments();

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (applicationStatus.length) {
      nextSearchParams.set("status", applicationStatus.join(","));
    } else {
      nextSearchParams.delete("status");
    }

    if (nextSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(nextSearchParams, { replace: true });
    }
  }, [applicationStatus, searchParams, setSearchParams]);

  useEffect(() => {
    if (
      !acceptOrderAssignmentModal &&
      !rejectOrderAssignmentModal &&
      !reassignOrderAssignmentModal
    ) {
      let userId: UUID | undefined = undefined;

      if (user?.userRoles?.some((role) => ["RIDER"].includes(role.role.name))) {
        userId = user?.id;
      }

      const statuses = applicationStatus?.length
        ? applicationStatus.join(",")
        : filteredAssignmentStatuses.length > 0
          ? filteredAssignmentStatuses.join(",")
          : undefined;

      fetchOrderAssignments({
        page,
        size,
        assignedToId: userId,
        status: statuses,
        prioritizeUnassigned,
      });
    }
  }, [
    fetchOrderAssignments,
    page,
    size,
    acceptOrderAssignmentModal,
    rejectOrderAssignmentModal,
    reassignOrderAssignmentModal,
    user?.userRoles,
    user?.id,
    applicationStatus,
    prioritizeUnassigned,
    filteredAssignmentStatuses,
  ]);

  const { orderAssignmentsColumns } = useOrderAssignmentsColumns();

  return (
    <main className="w-full flex flex-col gap-4">
      <fieldset className="w-full grid grid-cols-4 gap-4 max-md:grid-cols-3 max-sm:grid-cols-2">
        {statusFilter}
      </fieldset>
      <Table
        columns={orderAssignmentsColumns}
        data={orderAssignmentsList}
        showPagination={true}
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isFetching}
      />
      <AcceptOrderAssignment />
      <RejectOrderAssignment />
      <ReassignOrderAssignment />
    </main>
  );
};

export default OrderAssignmentsPage;
