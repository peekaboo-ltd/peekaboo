import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_config.dart';
import '../models/user.dart';

/// Secure persistence ported from mobile/services/storage/secureStorage.ts.
/// Uses the platform keychain (iOS) / encrypted shared preferences (Android).
class SecureStorage {
  final FlutterSecureStorage _store;

  SecureStorage([FlutterSecureStorage? store])
      : _store = store ?? const FlutterSecureStorage();

  Future<void> saveToken(String token) =>
      _write(StorageKeys.authToken, token);

  Future<String?> getToken() => _read(StorageKeys.authToken);

  Future<void> removeToken() => _delete(StorageKeys.authToken);

  Future<void> saveRefreshToken(String token) =>
      _write(StorageKeys.refreshToken, token);

  Future<String?> getRefreshToken() => _read(StorageKeys.refreshToken);

  Future<void> removeRefreshToken() => _delete(StorageKeys.refreshToken);

  Future<void> saveUserData(User user) =>
      _write(StorageKeys.userData, jsonEncode(user.toJson()));

  Future<User?> getUserData() async {
    try {
      final data = await _store.read(key: StorageKeys.userData);
      if (data == null) return null;
      return User.fromJson(jsonDecode(data) as Map<String, dynamic>);
    } catch (e) {
      debugPrint('Error getting user data: $e');
      return null;
    }
  }

  Future<void> removeUserData() => _delete(StorageKeys.userData);

  Future<void> clearAllData() async {
    try {
      await Future.wait([
        removeToken(),
        removeRefreshToken(),
        removeUserData(),
      ]);
    } catch (e) {
      debugPrint('Error clearing all data: $e');
      rethrow;
    }
  }

  Future<bool> isAuthenticated() async => await getToken() != null;

  Future<void> saveLanguage(String language) async {
    try {
      await _store.write(key: StorageKeys.language, value: language);
    } catch (e) {
      debugPrint('Error saving language preference: $e');
    }
  }

  Future<String?> getLanguage() async {
    try {
      return await _store.read(key: StorageKeys.language);
    } catch (e) {
      debugPrint('Error getting language preference: $e');
      return null;
    }
  }

  Future<void> _write(String key, String value) async {
    try {
      await _store.write(key: key, value: value);
    } catch (e) {
      debugPrint('Error saving $key: $e');
      rethrow;
    }
  }

  Future<String?> _read(String key) async {
    try {
      return await _store.read(key: key);
    } catch (e) {
      debugPrint('Error reading $key: $e');
      return null;
    }
  }

  Future<void> _delete(String key) async {
    try {
      await _store.delete(key: key);
    } catch (e) {
      debugPrint('Error deleting $key: $e');
      rethrow;
    }
  }
}

final secureStorageProvider = Provider<SecureStorage>((_) => SecureStorage());
