import axios, { AxiosError } from 'axios';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: number;
  details?: unknown;
}

/**
 * Handle API errors and return structured error object
 */
export const handleAPIError = (error: unknown): AppError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    if (axiosError.response) {
      // Server responded with error
      const status = axiosError.response.status;
      const message = axiosError.response.data?.message || 
                     axiosError.response.data?.error || 
                     'An error occurred';
      
      if (status === 401) {
        return {
          type: ErrorType.AUTH,
          message: 'Session expired. Please login again.',
          code: status,
        };
      }
      
      if (status === 400 || status === 422) {
        return {
          type: ErrorType.VALIDATION,
          message,
          code: status,
          details: axiosError.response.data,
        };
      }
      
      if (status >= 500) {
        return {
          type: ErrorType.SERVER,
          message: 'Server error. Please try again later.',
          code: status,
        };
      }
      
      return {
        type: ErrorType.SERVER,
        message,
        code: status,
        details: axiosError.response.data,
      };
    }
    
    if (axiosError.request) {
      // Network error
      return {
        type: ErrorType.NETWORK,
        message: 'Network error. Please check your connection.',
      };
    }
  }
  
  // Unknown error
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  return {
    type: ErrorType.UNKNOWN,
    message: errorMessage,
  };
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorType.AUTH:
      return 'Your session has expired. Please login again.';
    case ErrorType.VALIDATION:
      return error.message;
    case ErrorType.SERVER:
      return 'Something went wrong. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};
