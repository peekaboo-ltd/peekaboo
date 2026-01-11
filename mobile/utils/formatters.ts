import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns';

/**
 * Format currency value
 */
export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'RWF'): string => {
  if (amount === null || amount === undefined) return `${currency} 0`;
  
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${currency} 0`;
  
  return `${currency} ${numAmount.toLocaleString()}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format time to readable string
 */
export const formatTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm');
  } catch {
    return 'Invalid Time';
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format smart date (Today, Yesterday, or date)
 */
export const formatSmartDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Today, ${format(date, 'HH:mm')}`;
    }
    
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'HH:mm')}`;
    }
    
    return format(date, 'MMM dd, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format distance
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format estimated time
 */
export const formatEstimatedTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Format order reference ID
 */
export const formatOrderRef = (referenceId: string): string => {
  return `#${referenceId}`;
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    PENDING: '#F59E0B',
    ACTIVE: '#2563EB',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444',
    REJECTED: '#EF4444',
    IN_TRANSIT: '#3B82F6',
    DELIVERED: '#10B981',
  };
  
  return statusColors[status] || '#6B7280';
};
