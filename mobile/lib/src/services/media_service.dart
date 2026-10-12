import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gal/gal.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

/// Camera/gallery capture (Expo ImagePicker parity) plus reverse-geocode
/// labels and gallery saving (expo-media-library parity via gal).
class MediaService {
  final ImagePicker _picker;

  MediaService([ImagePicker? picker]) : _picker = picker ?? ImagePicker();

  /// Photo from the camera (quality 80, no editing — matches the Expo calls).
  Future<XFile?> takePhoto() {
    return _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );
  }

  /// Video from the camera, max 120s (report-problem flow).
  Future<XFile?> takeVideo() {
    return _picker.pickVideo(
      source: ImageSource.camera,
      maxDuration: const Duration(seconds: 120),
    );
  }

  /// Avatar flow. Note: the Expo app's 1:1 crop UI has no equivalent here;
  /// the picked image uploads uncropped.
  Future<XFile?> pickAvatar({required bool fromCamera}) {
    return fromCamera
        ? _picker.pickImage(
            source: ImageSource.camera,
            imageQuality: 80,
          )
        : _picker.pickImage(
            source: ImageSource.gallery,
            imageQuality: 80,
          );
  }

  /// Balanced-accuracy foreground fix (Expo Accuracy.Balanced parity).
  Future<Position?> currentPosition() async {
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
        ),
      );
    } catch (_) {
      return null;
    }
  }

  /// Reverse-geocode label in the same part order as the Expo app
  /// (name, street, district, city, region, postalCode, country), deduped.
  Future<String> addressLabel(double latitude, double longitude) async {
    try {
      final marks = await Geocoding().placemarkFromCoordinates(
        latitude,
        longitude,
      );
      if (marks.isEmpty) return '';
      final m = marks.first;
      final parts = [
        m.name,
        m.street,
        m.subAdministrativeArea,
        m.locality,
        m.administrativeArea,
        m.postalCode,
        m.country,
      ]
          .whereType<String>()
          .map((p) => p.trim())
          .where((p) => p.isNotEmpty)
          .toSet()
          .toList();
      return parts.join(', ');
    } catch (_) {
      return '';
    }
  }

  /// Save a proof photo into the "Peekaboo Proofs" gallery album.
  Future<void> saveToProofsAlbum(String imagePath) {
    return Gal.putImage(imagePath, album: 'Peekaboo Proofs');
  }

  Future<bool> hasGalleryAccess() => Gal.hasAccess();

  Future<bool> requestGalleryAccess() => Gal.requestAccess();
}

final mediaServiceProvider = Provider<MediaService>((_) => MediaService());
