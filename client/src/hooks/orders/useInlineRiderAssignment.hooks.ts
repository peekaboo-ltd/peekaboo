import { useState, useEffect, useCallback } from 'react';
import { useLazyFetchUsersQuery } from '@/api/queries/users.queries';
import { useCreateOrderAssignment } from './orderAssignments.hooks';
import { useFetchOrders } from './orders.hooks';
import { RoleTypes } from '@/types/auth.type';
import { UserStatus } from '@/constants/user.constants';
import { OrderAssignmentStatus } from '@/types/orderAssignment.type';
import type { Order } from '@/types/order.type';
import type { User } from '@/types/user.type';
import { UUID } from '@/types';

export const useInlineRiderAssignment = (order: Order) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [fetchRiders, { data: ridersData, isFetching: isFetchingRiders }] =
    useLazyFetchUsersQuery();

  const { createOrderAssignment, isLoading: isAssigning, isSuccess } =
    useCreateOrderAssignment();

  const { fetchOrders, page, size } = useFetchOrders();

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch riders when debounced search changes or dropdown opens
  useEffect(() => {
    if (debouncedSearch.length >= 2 || isDropdownOpen) {
      fetchRiders({
        page: 0,
        size: 20,
        search: debouncedSearch,
        roles: [RoleTypes.RIDER],
        status: UserStatus.ACTIVE,
      });
    }
  }, [debouncedSearch, isDropdownOpen, fetchRiders]);

  // Get current active or pending assignment
  const activeAssignment = order.assignments?.find(
    (a) => a.status === OrderAssignmentStatus.ACTIVE || a.status === OrderAssignmentStatus.PENDING
  );

  // Handle rider selection
  const handleRiderSelect = useCallback(
    (riderId: UUID) => {
      if (order?.id && riderId) {
        createOrderAssignment({
          orderId: order?.id,
          assignedToId: riderId,
        });
      }
      setIsDropdownOpen(false);
      setSearchTerm('');
    },
    [order?.id, createOrderAssignment]
  );

  // Refetch orders after successful assignment
  useEffect(() => {
    if (isSuccess) {
      fetchOrders({ page, size });
      setIsDropdownOpen(false);
    }
  }, [isSuccess, fetchOrders, page, size]);

  const riders = (ridersData?.data?.rows || []) as User[];

  return {
    searchTerm,
    setSearchTerm,
    riders,
    isFetchingRiders,
    isAssigning,
    isDropdownOpen,
    setIsDropdownOpen,
    activeAssignment,
    handleRiderSelect,
  };
};
