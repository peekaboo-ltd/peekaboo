import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import 'api_client.dart';

/// User endpoints ported from mobile/services/api/users.ts.

class UpdateUserPayload {
  final String? name;
  final String? email;
  final String? phoneNumber;
  final String? dateOfBirth;
  final String? nationality;
  final UserStatus? status;

  const UpdateUserPayload({
    this.name,
    this.email,
    this.phoneNumber,
    this.dateOfBirth,
    this.nationality,
    this.status,
  });

  Map<String, dynamic> toJson() => {
        if (name != null) 'name': name,
        if (email != null) 'email': email,
        if (phoneNumber != null) 'phoneNumber': phoneNumber,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
        if (nationality != null) 'nationality': nationality,
        if (status != null) 'status': userStatusToJson(status!),
      };
}

class StatusWithProofPayload {
  final UserStatus status;
  final double latitude;
  final double longitude;
  final String? locationLabel;
  final String? capturedAt;
  final String proofImagePath;
  final String? overlayTimestamp;
  final String? overlayLocationLabel;
  final bool? overlayAppliedOnClient;

  const StatusWithProofPayload({
    required this.status,
    required this.latitude,
    required this.longitude,
    this.locationLabel,
    this.capturedAt,
    required this.proofImagePath,
    this.overlayTimestamp,
    this.overlayLocationLabel,
    this.overlayAppliedOnClient,
  });
}

class UsersApi {
  final ApiClient _client;

  UsersApi(this._client);

  Future<UserLocation> updateCurrentLocation({
    required double latitude,
    required double longitude,
  }) async {
    final response = await _client.dio.patch(
      '/users/me/current-location',
      data: {'latitude': latitude, 'longitude': longitude},
    );
    return UserLocation.fromJson(envelopeData<Map<String, dynamic>>(response));
  }

  Future<User> updateUser(String id, UpdateUserPayload payload) async {
    final response = await _client.dio.patch(
      '/users/$id',
      data: payload.toJson(),
    );
    return User.fromJson(envelopeData<Map<String, dynamic>>(response));
  }

  Future<FormData> _proofFormData(StatusWithProofPayload payload) async {
    return FormData.fromMap({
      'status': userStatusToJson(payload.status),
      'latitude': payload.latitude.toString(),
      'longitude': payload.longitude.toString(),
      if (payload.locationLabel != null)
        'locationLabel': payload.locationLabel!,
      if (payload.capturedAt != null) 'capturedAt': payload.capturedAt!,
      if (payload.overlayTimestamp != null)
        'overlayTimestamp': payload.overlayTimestamp!,
      if (payload.overlayLocationLabel != null)
        'overlayLocationLabel': payload.overlayLocationLabel!,
      if (payload.overlayAppliedOnClient != null)
        'overlayAppliedOnClient': payload.overlayAppliedOnClient.toString(),
      'proofImage': await MultipartFile.fromFile(
        payload.proofImagePath,
        filename: 'status-proof-${DateTime.now().millisecondsSinceEpoch}.jpg',
      ),
    });
  }

  /// One retry on transport failure or 5xx (mirrors usersAPI).
  Future<User> updateMyStatusWithProof(StatusWithProofPayload payload) async {
    try {
      final response = await _client.dio.patch(
        '/users/me/status-with-proof',
        data: await _proofFormData(payload),
      );
      return User.fromJson(envelopeData<Map<String, dynamic>>(response));
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      final canRetry = e.response == null ||
          (status != null && status >= 500 && status < 600);
      if (!canRetry) rethrow;
      final retry = await _client.dio.patch(
        '/users/me/status-with-proof',
        data: await _proofFormData(payload),
      );
      return User.fromJson(envelopeData<Map<String, dynamic>>(retry));
    }
  }

  Future<User> uploadAvatar(String id, String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath, filename: 'avatar.jpg'),
    });
    final response = await _client.dio.post(
      '/users/$id/avatar',
      data: formData,
    );
    return User.fromJson(envelopeData<Map<String, dynamic>>(response));
  }

  Future<User> removeAvatar(String id) async {
    final response = await _client.dio.delete('/users/$id/avatar');
    return User.fromJson(envelopeData<Map<String, dynamic>>(response));
  }
}

final usersApiProvider = Provider<UsersApi>(
  (ref) => UsersApi(ref.watch(apiClientProvider)),
);
