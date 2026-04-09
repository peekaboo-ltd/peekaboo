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
 * Using Color Hunt Palette: #061E29 #1D546D #5F9598 #F3F4F4
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    PENDING: '#FCBF49', // Peekaboo yellow
    ACTIVE: '#1D546D', // Dark teal - primary color
    COMPLETED: '#10B981', // Keep success color
    CANCELLED: '#EF4444', // Keep danger color
    REJECTED: '#EF4444', // Keep danger color
    IN_TRANSIT: '#5F9598', // Lighter muted teal
    DELIVERED: '#10B981', // Keep success color
  };
  
  return statusColors[status] || '#5F9598'; // Default to muted teal
};
