import Modal from '@/components/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setReassignOrderAssignmentModal, setSelectedOrderAssignment } from '@/states/slices/orderAssignment.slice';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useLazyFetchUsersQuery } from '@/api/queries/users.queries';
import { useCreateOrderAssignment, useFetchOrderAssignments } from '@/hooks/orders/orderAssignments.hooks';
import { RoleTypes } from '@/types/auth.type';
import { UserStatus } from '@/constants/user.constants';
import type { User } from '@/types/user.type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUser, faCheck, faArrowLeft, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/inputs/Button';

const ReassignOrderAssignment = () => {
    // STATE VARIABLES
    const dispatch = useAppDispatch();
    const { reassignOrderAssignmentModal, selectedOrderAssignment } = useAppSelector((state) => state.orderAssignment);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedRider, setSelectedRider] = useState<User | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [fetchRiders, { data: ridersData, isFetching: isFetchingRiders }] =
        useLazyFetchUsersQuery();

    const { createOrderAssignment, isLoading: isAssigning, isSuccess } =
        useCreateOrderAssignment();

    const { fetchOrderAssignments, page, size } = useFetchOrderAssignments();

    // Debounce search input (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch riders when debounced search changes or modal opens
    useEffect(() => {
        if (reassignOrderAssignmentModal && (debouncedSearch.length >= 2 || searchTerm === '')) {
            fetchRiders({
                page: 0,
                size: 20,
                search: debouncedSearch,
                roles: [RoleTypes.RIDER],
                status: UserStatus.ACTIVE,
            });
        }
    }, [debouncedSearch, reassignOrderAssignmentModal, fetchRiders, searchTerm]);

    // CLOSE MODAL
    const closeModal = useCallback(() => {
        dispatch(setReassignOrderAssignmentModal(false));
        dispatch(setSelectedOrderAssignment(undefined));
        setSearchTerm('');
        setDebouncedSearch('');
        setSelectedRider(null);
    }, [dispatch]);

    // Focus input when modal opens
    useEffect(() => {
        if (reassignOrderAssignmentModal) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [reassignOrderAssignmentModal]);

    // Handle successful reassignment
    useEffect(() => {
        if (isSuccess) {
            fetchOrderAssignments({ page, size });
            closeModal();
        }
    }, [closeModal, fetchOrderAssignments, isSuccess, page, size]);

    // Handle rider selection - show details first
    const handleRiderSelect = useCallback(
        (rider: User) => {
            setSelectedRider(rider);
        },
        []
    );

    // Handle confirmation and assignment
    const handleConfirmAssignment = useCallback(() => {
        if (selectedRider && selectedOrderAssignment?.orderId) {
            createOrderAssignment({
                orderId: selectedOrderAssignment?.orderId,
                assignedToId: selectedRider.id,
            });
        }
    }, [selectedRider, selectedOrderAssignment, createOrderAssignment]);

    // Handle going back to rider selection
    const handleBackToSelection = useCallback(() => {
        setSelectedRider(null);
        setSearchTerm('');
        setDebouncedSearch('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const riders = (ridersData?.data?.rows || []) as User[];

    return (
        <Modal
            isOpen={reassignOrderAssignmentModal}
            onClose={closeModal}
            heading={`Reassign ${selectedOrderAssignment?.order?.referenceId || 'Order'}`}
            className="max-w-4xl w-full"
        >
            <form
                className="flex flex-col h-full min-h-[60vh]"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedRider) {
                        handleConfirmAssignment();
                    }
                }}
            >
                {!selectedRider ? (
                    <>
                        {/* Search Section */}
                        <fieldset className="flex flex-col mb-2" disabled={isAssigning}>
                            <legend className="sr-only">Search for a rider</legend>

                            <label htmlFor="rider-search" className="block text-sm font-medium text-[--ink] mb-2">
                                Search for a new rider
                            </label>
                            <input
                                ref={inputRef}
                                id="rider-search"
                                type="search"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 w-full rounded-[--radius-control] border-0 bg-[--surface] px-3 text-sm outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
                                aria-label="Search riders"
                                disabled={isAssigning}
                            />
                        </fieldset>

                        {/* Riders List */}
                        <section className="flex-1 overflow-auto border border-[--line] rounded-md min-h-0">
                            {isFetchingRiders ? (
                                <p className="px-4 py-8 text-sm text-[--muted] text-center" role="status" aria-live="polite">
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" aria-hidden="true" />
                                    Loading riders...
                                </p>
                            ) : riders.length === 0 ? (
                                <p className="px-4 py-8 text-sm text-[--muted] text-center" role="status">
                                    {searchTerm ? 'No riders found matching your search' : 'No riders available'}
                                </p>
                            ) : (
                                <menu className="divide-y divide-gray-100" role="listbox">
                                    {riders.map((rider) => {
                                        const isCurrentRider = rider.id === selectedOrderAssignment?.assignedToId;
                                        return (
                                            <li key={rider.id} className="list-none">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRiderSelect(rider);
                                                    }}
                                                    disabled={isAssigning || isCurrentRider}
                                                    className={`w-full px-4 py-3 text-left hover:bg-[--surface] transition-colors disabled:opacity-50 cursor-pointer ${isCurrentRider ? 'bg-[--surface]' : ''
                                                        }`}
                                                    role="option"
                                                    aria-selected={isCurrentRider}
                                                >
                                                    <span className="flex items-center justify-between">
                                                        <span className="flex-1">
                                                            <strong className="block text-sm font-medium text-[--ink]">
                                                                {rider.name || 'Unnamed Rider'}
                                                            </strong>
                                                            <span className="block text-xs text-[--muted] mt-0.5">
                                                                {rider.phoneNumber}
                                                            </span>
                                                        </span>
                                                        {isCurrentRider && (
                                                            <span className="text-xs text-[--ink] font-medium ml-2">
                                                                Current
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </menu>
                            )}
                        </section>

                        {/* Footer */}
                        <footer className="mt-4 flex justify-end gap-2 pt-4 border-t">
                            <Button
                                type="button"
                                onClick={closeModal}
                                disabled={isAssigning}
                                className="px-4 py-2 text-sm font-medium text-[--ink] bg-[--surface] rounded-md hover:bg-[--surface] cursor-pointer"
                                styled={false}
                            >
                                Cancel
                            </Button>
                        </footer>
                    </>
                ) : (
                    <>
                        {/* Selected Rider Details */}
                        <section className="flex-1 flex flex-col">
                            <header className="mb-4">
                                <Button
                                    type="button"
                                    onClick={handleBackToSelection}
                                    className="flex items-center text-sm text-[--muted] hover:text-[--ink] mb-4 cursor-pointer"
                                    disabled={isAssigning}
                                    icon={faArrowLeft}
                                    styled={false}
                                >
                                    Back to selection
                                </Button>
                                <h2 className="text-lg font-medium text-[--ink]">
                                    Confirm Rider Assignment
                                </h2>
                                <p className="text-sm text-[--muted] mt-1">
                                    Review the rider details before confirming the assignment
                                </p>
                            </header>

                            <article className="flex-1 bg-[--surface] rounded-lg border border-[--line] p-6">
                                <figure className="flex items-start space-x-4">
                                    <span className="shrink-0 w-16 h-16 bg-[--ink] rounded-full flex items-center justify-center" role="img" aria-label="Rider avatar">
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="w-8 h-8 text-[--ink]"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <figcaption className="flex-1 min-w-0">
                                        <h3 className="text-xl font-medium text-[--ink] mb-2">
                                            {selectedRider.name || 'Unnamed Rider'}
                                        </h3>

                                        <dl className="space-y-3">
                                            <dt className="sr-only">Phone Number</dt>
                                            <dd className="flex items-center text-sm text-[--ink]">
                                                <FontAwesomeIcon
                                                    icon={faPhone}
                                                    className="w-4 h-4 mr-2 text-[--muted]"
                                                    aria-hidden="true"
                                                />
                                                <span>{selectedRider.phoneNumber}</span>
                                            </dd>

                                            {selectedRider.email && (
                                                <>
                                                    <dt className="sr-only">Email</dt>
                                                    <dd className="flex items-center text-sm text-[--ink]">
                                                        <FontAwesomeIcon
                                                            icon={faEnvelope}
                                                            className="w-4 h-4 mr-2 text-[--muted]"
                                                            aria-hidden="true"
                                                        />
                                                        <span>{selectedRider.email}</span>
                                                    </dd>
                                                </>
                                            )}

                                            <dt className="sr-only">Status</dt>
                                            <dd className="flex items-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedRider.status === UserStatus.ACTIVE
                                                    ? 'bg-[--surface] text-[--ink]'
                                                    : 'bg-[--surface] text-[--ink]'
                                                    }`}>
                                                    {selectedRider.status}
                                                </span>
                                            </dd>
                                        </dl>
                                    </figcaption>
                                </figure>
                            </article>
                        </section>

                        {/* Footer with Confirm Button */}
                        <footer className="mt-6 flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={isAssigning}
                                isLoading={isAssigning}
                                primary
                                icon={faCheck}
                                className="px-6 py-2 text-sm font-medium cursor-pointer"
                            >
                                Confirm Assignment
                            </Button>
                        </footer>
                    </>
                )}
            </form>
        </Modal>
    );
};

export default ReassignOrderAssignment;
