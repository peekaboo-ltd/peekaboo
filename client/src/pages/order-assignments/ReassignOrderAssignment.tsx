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
import { faUser, faCheck, faArrowLeft, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/inputs/Button';
import { LoadingItem } from '@/components/ui/loading-item';
import { controlClassName } from '@/components/inputs/control';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/i18n';

const ReassignOrderAssignment = () => {
    const { t } = useI18n();
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
            heading={t('assignments.reassignTitle', { reference: selectedOrderAssignment?.order?.referenceId || t('orders.orderFallback') })}
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
                            <legend className="sr-only">{t('assignments.searchRider')}</legend>

                            <label htmlFor="rider-search" className="block text-sm font-normal text-(--ink) mb-2">
                                {t('assignments.searchNewRider')}
                            </label>
                            <input
                                ref={inputRef}
                                id="rider-search"
                                type="search"
                                placeholder={t('assignments.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(controlClassName, 'px-3')}
                                aria-label={t('assignments.searchRider')}
                                disabled={isAssigning}
                            />
                        </fieldset>

                        {/* Riders List */}
                        <section className="flex-1 overflow-auto border border-(--line) rounded-md min-h-0">
                            {isFetchingRiders ? (
                                <div className="px-4 py-8" role="status" aria-live="polite">
                                    <LoadingItem title={t('assignments.loadingRiders')} className="mx-auto" />
                                </div>
                            ) : riders.length === 0 ? (
                                <p className="px-4 py-8 text-sm text-(--muted) text-center" role="status">
                                    {searchTerm ? t('assignments.noRiderMatch') : t('assignments.noRiders')}
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
                                                    className={`w-full px-4 py-3 text-left hover:bg-(--surface) transition-colors disabled:opacity-50 cursor-pointer ${isCurrentRider ? 'bg-(--surface)' : ''
                                                        }`}
                                                    role="option"
                                                    aria-selected={isCurrentRider}
                                                >
                                                    <span className="flex items-center justify-between">
                                                        <span className="flex-1">
                                                            <strong className={`block text-sm font-normal text-(--ink) ${isCurrentRider ? 'text-(--ink-hover)' : ''}`}>
                                                                {rider.name || t('assignments.unnamedRider')}
                                                            </strong>
                                                            <span className="block text-xs text-(--muted) mt-0.5">
                                                                {rider.phoneNumber}
                                                            </span>
                                                        </span>
                                                        {isCurrentRider && (
                                                            <span className="text-xs text-(--ink) font-normal ml-2">
                                                                {t('assignments.current')}
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
                                variant="secondary"
                            >
                                {t('users.cancel')}
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
                                    className="mb-4 -ml-3 self-start text-(--muted) hover:text-(--ink)"
                                    disabled={isAssigning}
                                    icon={faArrowLeft}
                                    variant="ghost"
                                    size="sm"
                                >
                                    {t('assignments.backSelection')}
                                </Button>
                                <h2 className="type-card-title">
                                    {t('assignments.confirmTitle')}
                                </h2>
                                <p className="text-sm text-(--muted) mt-1">
                                    {t('assignments.confirmDescription')}
                                </p>
                            </header>

                            <article className="flex-1 bg-(--surface) rounded-lg p-6">
                                <figure className="flex items-start space-x-4">
                                    <span className="shrink-0 w-16 h-16 bg-(--ink) rounded-full flex items-center justify-center" role="img" aria-label={t('assignments.riderAvatar')}>
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="w-8 h-8 text-(--ink)"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <figcaption className="flex-1 min-w-0">
                                        <h3 className="type-h3 mb-2">
                                            {selectedRider.name || t('assignments.unnamedRider')}
                                        </h3>

                                        <dl className="space-y-3">
                                            <dt className="sr-only">{t('users.phone')}</dt>
                                            <dd className="flex items-center text-sm text-(--ink)">
                                                <FontAwesomeIcon
                                                    icon={faPhone}
                                                    className="w-4 h-4 mr-2 text-(--muted)"
                                                    aria-hidden="true"
                                                />
                                                <span>{selectedRider.phoneNumber}</span>
                                            </dd>

                                            {selectedRider.email && (
                                                <>
                                                    <dt className="sr-only">{t('users.email')}</dt>
                                                    <dd className="flex items-center text-sm text-(--ink)">
                                                        <FontAwesomeIcon
                                                            icon={faEnvelope}
                                                            className="w-4 h-4 mr-2 text-(--muted)"
                                                            aria-hidden="true"
                                                        />
                                                        <span>{selectedRider.email}</span>
                                                    </dd>
                                                </>
                                            )}

                                            <dt className="sr-only">{t('common.status')}</dt>
                                            <dd className="flex items-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal ${selectedRider.status === UserStatus.ACTIVE
                                                    ? 'bg-(--surface) text-(--ink)'
                                                    : 'bg-(--surface) text-(--ink)'
                                                    }`}>
                                                    {t(`status.${selectedRider.status.toLowerCase()}`)}
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
                                className="px-6 py-2 text-sm font-normal cursor-pointer"
                            >
                                {t('assignments.confirm')}
                            </Button>
                        </footer>
                    </>
                )}
            </form>
        </Modal>
    );
};

export default ReassignOrderAssignment;
