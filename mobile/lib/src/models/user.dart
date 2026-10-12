// Domain models ported from mobile/types/auth.ts.

enum UserStatus { active, inactive, suspended }

UserStatus userStatusFromJson(String? value) {
  switch (value) {
    case 'ACTIVE':
      return UserStatus.active;
    case 'SUSPENDED':
      return UserStatus.suspended;
    case 'INACTIVE':
    default:
      return UserStatus.inactive;
  }
}

String userStatusToJson(UserStatus status) {
  switch (status) {
    case UserStatus.active:
      return 'ACTIVE';
    case UserStatus.suspended:
      return 'SUSPENDED';
    case UserStatus.inactive:
      return 'INACTIVE';
  }
}

class Role {
  final String id;
  final String name;

  const Role({required this.id, required this.name});

  factory Role.fromJson(Map<String, dynamic> json) => Role(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {'id': id, 'name': name};
}

class UserRole {
  final String id;
  final Role? role;

  const UserRole({required this.id, this.role});

  factory UserRole.fromJson(Map<String, dynamic> json) => UserRole(
        id: json['id'] as String? ?? '',
        role: json['role'] is Map<String, dynamic>
            ? Role.fromJson(json['role'] as Map<String, dynamic>)
            : null,
      );

  Map<String, dynamic> toJson() => {'id': id, 'role': role?.toJson()};
}

class UserLocation {
  final double latitude;
  final double longitude;
  final String? collectedAt;

  const UserLocation({
    required this.latitude,
    required this.longitude,
    this.collectedAt,
  });

  factory UserLocation.fromJson(Map<String, dynamic> json) => UserLocation(
        latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
        longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
        collectedAt: json['collectedAt'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        if (collectedAt != null) 'collectedAt': collectedAt,
      };
}

class User {
  final String id;
  final String? name;
  final String? email;
  final String phoneNumber;
  final String? dateOfBirth;
  final UserStatus status;
  final String? nationality;
  final List<UserRole>? userRoles;
  final UserLocation? currentLocation;
  final String? profilePhotoUrl;
  final String createdAt;
  final String updatedAt;

  const User({
    required this.id,
    this.name,
    this.email,
    required this.phoneNumber,
    this.dateOfBirth,
    required this.status,
    this.nationality,
    this.userRoles,
    this.currentLocation,
    this.profilePhotoUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String? ?? '',
        name: json['name'] as String?,
        email: json['email'] as String?,
        phoneNumber: json['phoneNumber'] as String? ?? '',
        dateOfBirth: json['dateOfBirth'] as String?,
        status: userStatusFromJson(json['status'] as String?),
        nationality: json['nationality'] as String?,
        userRoles: (json['userRoles'] as List?)
            ?.whereType<Map<String, dynamic>>()
            .map(UserRole.fromJson)
            .toList(),
        currentLocation: json['currentLocation'] is Map<String, dynamic>
            ? UserLocation.fromJson(
                json['currentLocation'] as Map<String, dynamic>)
            : null,
        profilePhotoUrl: json['profilePhotoUrl'] as String?,
        createdAt: json['createdAt'] as String? ?? '',
        updatedAt: json['updatedAt'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        if (name != null) 'name': name,
        if (email != null) 'email': email,
        'phoneNumber': phoneNumber,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
        'status': userStatusToJson(status),
        if (nationality != null) 'nationality': nationality,
        if (userRoles != null)
          'userRoles': userRoles!.map((r) => r.toJson()).toList(),
        if (currentLocation != null)
          'currentLocation': currentLocation!.toJson(),
        if (profilePhotoUrl != null) 'profilePhotoUrl': profilePhotoUrl,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };

  User copyWith({
    String? name,
    String? email,
    String? phoneNumber,
    String? dateOfBirth,
    UserStatus? status,
    String? nationality,
    UserLocation? currentLocation,
    String? profilePhotoUrl,
  }) {
    return User(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      status: status ?? this.status,
      nationality: nationality ?? this.nationality,
      userRoles: userRoles,
      currentLocation: currentLocation ?? this.currentLocation,
      profilePhotoUrl: profilePhotoUrl ?? this.profilePhotoUrl,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

class LoginCredentials {
  final String username;
  final String password;

  const LoginCredentials({required this.username, required this.password});

  Map<String, dynamic> toJson() =>
      {'username': username, 'password': password};
}

class AuthResponse {
  final User user;
  final String token;
  final String? refreshToken;

  const AuthResponse({required this.user, required this.token, this.refreshToken});
}
