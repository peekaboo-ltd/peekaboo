import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Order } from '@/types/order.type';
import type { User } from '@/types/user.type';
import { useInlineRiderAssignment } from '@/hooks/orders/useInlineRiderAssignment.hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { OrderAssignmentStatus } from '@/types/orderAssignment.type';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';

interface InlineRiderSelectProps {
  order: Order;
  isCustomer?: boolean;
}

const InlineRiderSelect = ({ order, isCustomer = false }: InlineRiderSelectProps) => {
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
    if (!rider) return 'Assign Rider';
    const name = rider.name || 'Unnamed';
    const phone = rider.phoneNumber ? ` (${rider.phoneNumber.slice(-4)})` : '';
    return `${name}${phone}`;
  };

  // Get background color based on assignment status
  const getStatusBackgroundColor = (status?: string) => {
    let bgColor = 'bg-(--surface) hover:bg-(--surface)';

    switch (status) {
      case OrderAssignmentStatus.PENDING:
        bgColor = 'bg-(--surface) text-(--paper)';
        break;
      case OrderAssignmentStatus.ACTIVE:
        bgColor = 'bg-(--surface) text-(--paper)';
        break;
      case OrderAssignmentStatus.REJECTED:
    }

    return bgColor;
  };

  // Render current assignment status
  const renderAssignmentStatus = () => {
    if (isAssigning) {
      return (
        <span className="text-xs text-(--muted) w-full text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
          Assigning...
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
        No assignment
      </span>
    );
  };

  const dropdownContent =
    isDropdownOpen && dropdownPosition ? (
      <section
        ref={dropdownRef}
        className="fixed z-10000 overflow-hidden rounded-(--radius-control) border-0 bg-(--surface) shadow-[var(--shadow-menu)]"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }}
      >
        <header className="p-2 border-b border-(--line)">
          <input
            ref={inputRef}
            type="search"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-(--radius-control) border-0 bg-(--paper) px-3 text-sm outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
            aria-label="Search riders"
          />
        </header>
        <menu className="max-h-60 overflow-auto">
          {isFetchingRiders ? (
            <li className="px-3 py-2 text-sm text-(--muted) text-center list-none">
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Loading riders...
            </li>
          ) : riders.length === 0 ? (
            <li className="px-3 py-2 text-sm text-(--muted) text-center list-none">
              No riders found
            </li>
          ) : (
            riders.map((rider) => (
              <li key={rider.id} className="list-none">
                <Link
                  to={`/users/${rider?.id}`}
                  className="w-full px-3 py-2 text-left hover:bg-(--surface) border-b border-(--line) last:border-b-0 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (rider?.id) {
                      handleRiderSelect(rider?.id);
                    }
                  }}
                >
                  <strong className="block text-sm font-medium text-(--ink)">
                    {rider?.name || 'Unnamed Rider'}
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
      <p
        className={`text-sm text-(--ink) px-4 py-2 rounded-md ${getStatusBackgroundColor(activeAssignment?.status)}`}
      >
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
        className={`text-sm text-(--ink) px-4 py-2 cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${getStatusBackgroundColor(activeAssignment?.status)}`}
        aria-label="Assign rider to order"
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
