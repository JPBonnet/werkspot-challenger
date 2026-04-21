enum UserRole { professional, customer }

class User {
  final String id;
  final String email;
  final String fullName;
  final String phone;
  final UserRole role;
  final DateTime createdAt;
  final String? avatarUrl;

  const User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.phone,
    required this.role,
    required this.createdAt,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['full_name'] as String,
      phone: json['phone'] as String,
      role: UserRole.values.byName(json['role'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
      avatarUrl: json['avatar_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'full_name': fullName,
        'phone': phone,
        'role': role.name,
        'created_at': createdAt.toIso8601String(),
        'avatar_url': avatarUrl,
      };

  User copyWith({
    String? email,
    String? fullName,
    String? phone,
    String? avatarUrl,
  }) {
    return User(
      id: id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      role: role,
      createdAt: createdAt,
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }
}
