import 'service.dart';

class Professional {
  final String id;
  final String userId;
  final String businessName;
  final String description;
  final List<ServiceCategory> services;
  final double rating;
  final int completedJobs;
  final String region;
  final bool isVerified;
  final double hourlyRate;

  const Professional({
    required this.id,
    required this.userId,
    required this.businessName,
    required this.description,
    required this.services,
    this.rating = 0.0,
    this.completedJobs = 0,
    required this.region,
    this.isVerified = false,
    required this.hourlyRate,
  });

  factory Professional.fromJson(Map<String, dynamic> json) {
    return Professional(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      businessName: json['business_name'] as String,
      description: json['description'] as String,
      services: (json['services'] as List)
          .map((s) => ServiceCategory.fromJson(s as Map<String, dynamic>))
          .toList(),
      rating: (json['rating'] as num).toDouble(),
      completedJobs: json['completed_jobs'] as int,
      region: json['region'] as String,
      isVerified: json['is_verified'] as bool,
      hourlyRate: (json['hourly_rate'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'business_name': businessName,
        'description': description,
        'services': services.map((s) => s.toJson()).toList(),
        'rating': rating,
        'completed_jobs': completedJobs,
        'region': region,
        'is_verified': isVerified,
        'hourly_rate': hourlyRate,
      };

  Professional copyWith({
    String? businessName,
    String? description,
    List<ServiceCategory>? services,
    double? rating,
    int? completedJobs,
    String? region,
    bool? isVerified,
    double? hourlyRate,
  }) {
    return Professional(
      id: id,
      userId: userId,
      businessName: businessName ?? this.businessName,
      description: description ?? this.description,
      services: services ?? this.services,
      rating: rating ?? this.rating,
      completedJobs: completedJobs ?? this.completedJobs,
      region: region ?? this.region,
      isVerified: isVerified ?? this.isVerified,
      hourlyRate: hourlyRate ?? this.hourlyRate,
    );
  }
}
