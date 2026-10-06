import 'package:dio/dio.dart';

/// Error classification ported from mobile/utils/errorHandler.ts.

enum ErrorType { network, auth, validation, server, unknown }

class AppError {
  final ErrorType type;
  final String message;
  final int? code;
  final Object? details;

  const AppError({
    required this.type,
    required this.message,
    this.code,
    this.details,
  });
}

AppError handleApiError(Object error) {
  if (error is DioException) {
    final response = error.response;
    if (response != null) {
      final status = response.statusCode ?? 0;
      final data = response.data;
      var message = 'An error occurred';
      if (data is Map<String, dynamic>) {
        message = (data['message'] ?? data['error'] ?? message).toString();
      }

      if (status == 401) {
        return AppError(
          type: ErrorType.auth,
          message: 'Session expired. Please login again.',
          code: status,
        );
      }
      if (status == 400 || status == 422) {
        return AppError(
          type: ErrorType.validation,
          message: message,
          code: status,
          details: data,
        );
      }
      if (status >= 500) {
        return AppError(
          type: ErrorType.server,
          message: 'Server error. Please try again later.',
          code: status,
        );
      }
      return AppError(
        type: ErrorType.server,
        message: message,
        code: status,
        details: data,
      );
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.unknown) {
      return const AppError(
        type: ErrorType.network,
        message: 'Network error. Please check your connection.',
      );
    }
  }

  return AppError(
    type: ErrorType.unknown,
    message: error is Exception
        ? error.toString()
        : 'An unexpected error occurred',
  );
}

String getErrorMessage(AppError error) {
  switch (error.type) {
    case ErrorType.network:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorType.auth:
      return 'Your session has expired. Please login again.';
    case ErrorType.validation:
      return error.message;
    case ErrorType.server:
      return 'Something went wrong. Please try again later.';
    case ErrorType.unknown:
      return error.message.isEmpty
          ? 'An unexpected error occurred.'
          : error.message;
  }
}

/// Extracts a server-provided message for flows that surface it directly
/// (e.g. the availability-update alert in the Expo dashboard).
String? serverMessage(Object error) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final message = data['message'];
      if (message is String && message.isNotEmpty) return message;
    }
  }
  return null;
}
