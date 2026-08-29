/**
 * Error Handler Utility
 * Centralized error parsing for API responses
 */

export interface FieldError {
  field: string;
  message: string;
  rowNumber?: number;
  orderId?: string;
  referenceId?: string;
}

export interface ParsedApiError {
  message: string;
  fieldErrors: Map<string, string[]>;
  rowErrors: Map<number, FieldError[]>;
  allErrors: FieldError[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Parses API error responses into a consistent structure
 * Handles various error response formats from the backend
 */
export function parseApiError(error: unknown): ParsedApiError {
  const result: ParsedApiError = {
    message: 'An unexpected error occurred',
    fieldErrors: new Map(),
    rowErrors: new Map(),
    allErrors: [],
  };

  // Handle null/undefined
  if (!error) {
    return result;
  }

  // Extract error data from various response structures
  let errorData: Record<string, unknown> | undefined;
  
  if (isRecord(error)) {
    // RTK Query error structure: { data: { message, errors } }
    if ('data' in error) {
      errorData = isRecord(error.data) ? error.data : undefined;
      
      // Handle nested data structure: { data: { data: { errors } } }
      if (isRecord(errorData?.data) && errorData.data.errors) {
        errorData = errorData.data;
      }
    } else {
      errorData = error;
    }
  }

  // Extract main message
  if (typeof errorData?.message === 'string') {
    result.message = errorData.message;
  }

  // Extract and organize errors array
  const errors = errorData?.errors ?? [];
  
  if (Array.isArray(errors)) {
    result.allErrors = errors;

    errors.forEach((err: FieldError) => {
      // Group by field
      if (err.field) {
        const fieldErrors = result.fieldErrors.get(err.field) || [];
        fieldErrors.push(err.message);
        result.fieldErrors.set(err.field, fieldErrors);
      }

      // Group by row number
      if (err.rowNumber !== undefined) {
        const rowErrors = result.rowErrors.get(err.rowNumber) || [];
        rowErrors.push(err);
        result.rowErrors.set(err.rowNumber, rowErrors);
      }
    });
  }

  return result;
}

/**
 * Formats error message for display in toast notifications
 */
export function formatErrorForToast(error: unknown): string {
  const parsed = parseApiError(error);
  
  if (parsed.allErrors.length > 0) {
    const firstError = parsed.allErrors[0];
    if (firstError.rowNumber) {
      return `Row ${firstError.rowNumber}: ${firstError.message}`;
    }
    return firstError.message;
  }
  
  return parsed.message;
}

/**
 * Gets all error messages for a specific field
 */
export function getFieldErrors(error: unknown, field: string): string[] {
  const parsed = parseApiError(error);
  return parsed.fieldErrors.get(field) || [];
}

/**
 * Gets all errors for a specific row number
 */
export function getRowErrors(error: unknown, rowNumber: number): FieldError[] {
  const parsed = parseApiError(error);
  return parsed.rowErrors.get(rowNumber) || [];
}

/**
 * Checks if error contains validation errors
 */
export function hasValidationErrors(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.allErrors.length > 0;
}

/**
 * Gets a summary of validation errors
 */
export function getErrorSummary(error: unknown): {
  totalErrors: number;
  affectedRows: number;
  errorsByType: Map<string, number>;
} {
  const parsed = parseApiError(error);
  
  const errorsByType = new Map<string, number>();
  parsed.allErrors.forEach((err) => {
    const count = errorsByType.get(err.field) || 0;
    errorsByType.set(err.field, count + 1);
  });

  return {
    totalErrors: parsed.allErrors.length,
    affectedRows: parsed.rowErrors.size,
    errorsByType,
  };
}
