import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Order } from '@/types/order.type';
import type { User } from '@/types/user.type';
import { useInlineRiderAssignment } from '@/hooks/orders/useInlineRiderAssignment.hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import { controlClassName } from '@/components/inputs/control';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/i18n';

interface InlineRiderSelectProps {
  order: Order;
  isCustomer?: boolean;
}

const InlineRiderSelect = ({ order, isCustomer = false }: InlineRiderSelectProps) => {
  const { t } = useI18n();
  const {
    searchTerm,
    setSearchTerm,
    riders,
    isFetchingRiders,
    isAssigning,
    isDropdownOpen,
    setIsDropdownOpen,
    activeAssignment,
    handleRiderSelect,
  } = useInlineRiderAssignment(order);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Update dropdown position when opened
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 250),
      });
    }
  };

  // Focus input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isDropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isDropdownOpen, setIsDropdownOpen, setSearchTerm]);

  // Format rider display
  const formatRiderDisplay = (rider?: User) => {
    if (!rider) return t('rider.assign');
    const name = rider.name || t('rider.unnamed');
    const phone = rider.phoneNumber ? ` (${rider.phoneNumber.slice(-4)})` : '';
    return `${name}${phone}`;
  };

  // Render current assignment status
  const renderAssignmentStatus = () => {
    if (isAssigning) {
      return (
        <span className="text-xs text-(--muted) w-full text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
          {t('rider.assigning')}
        </span>
      );
    }

    if (activeAssignment) {
      return (
        <span className="text-xs w-full text-center">
          {formatRiderDisplay(activeAssignment?.assignedTo)} {!isCustomer && <FontAwesomeIcon icon={faPenToSquare} />}
        </span>
      );
    }

    return (
      <span className="text-xs text-(--muted) w-full text-center">
        <FontAwesomeIcon icon={faUser} className="mr-1" />
        {t('rider.noAssignment')}
      </span>
    );
  };

  const dropdownContent =
    isDropdownOpen && dropdownPosition ? (
      <section
        ref={dropdownRef}
        className="fixed z-[10000] overflow-hidden rounded-(--radius-control) border border-(--line) bg-(--paper) shadow-(--shadow-menu)"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }}
      >
        <header className="border-b border-(--line) p-2">
          <input
            ref={inputRef}
            type="search"
            placeholder={t('rider.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(controlClassName, 'h-(--control-sm) px-3')}
            aria-label={t('rider.searchLabel')}
          />
        </header>
        <menu className="max-h-60 overflow-auto">
          {isFetchingRiders ? (
            <li className="px-3 py-2 text-sm text-(--muted) text-center list-none">
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              {t('rider.loading')}
            </li>
          ) : riders.length === 0 ? (
            <li className="px-3 py-2 text-sm text-(--muted) text-center list-none">
              {t('rider.noneFound')}
            </li>
          ) : (
            riders.map((rider) => (
              <li key={rider.id} className="list-none">
                <Link
                  to={`/users/${rider?.id}`}
                  className="block w-full cursor-pointer border-b border-(--line) px-3 py-2 text-left transition-[background-color] duration-200 ease-(--ease-flat) last:border-b-0 hover:bg-(--surface)"
                  onClick={(e) => {
                    e.preventDefault();
                    if (rider?.id) {
                      handleRiderSelect(rider?.id);
                    }
                  }}
                >
                  <strong className="block text-sm font-medium text-(--ink)">
                    {rider?.name || t('rider.unnamed')}
                  </strong>
                  <span className="block text-xs text-(--muted)">
                    {rider?.phoneNumber}
                  </span>
                </Link>
              </li>
            ))
          )}
        </menu>
      </section>
    ) : null;

  // If user is a customer, show read-only assignment status
  if (isCustomer) {
    return (
      <p className="type-body-sm px-1 py-1.5 text-(--ink)">
        {renderAssignmentStatus()}
      </p>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isAssigning}
        className="inline-flex h-(--control-sm) cursor-pointer items-center rounded-(--radius-control) bg-(--surface) px-3 text-sm text-(--ink) transition-[background-color] duration-200 ease-(--ease-flat) hover:bg-(--surface-hover) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t('rider.assignOrder')}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        {renderAssignmentStatus()}
      </button>
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
};

export default InlineRiderSelect;
