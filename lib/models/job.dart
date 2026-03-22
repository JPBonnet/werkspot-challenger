enum JobStatus {
  pending,
  accepted,
  inProgress,
  completed,
  cancelled,
  rejected,
}

class Job {
  final String id;
  final String customerId;
  final String? professionalId;
  final String serviceId;
  final String title;
  final String description;
  final String address;
  final String city;
  final String postalCode;
  final JobStatus status;
  final DateTime createdAt;
  final DateTime? scheduledAt;
  final DateTime? completedAt;
  final double? estimatedPrice;
  final double? finalPrice;
  final List<String> photos;

  const Job({
    required this.id,
    required this.customerId,
    this.professionalId,
    required this.serviceId,
    required this.title,
    required this.description,
    required this.address,
    required this.city,
    required this.postalCode,
    this.status = JobStatus.pending,
    required this.createdAt,
    this.scheduledAt,
    this.completedAt,
    this.estimatedPrice,
    this.finalPrice,
    this.photos = const [],
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] as String,
      customerId: json['customer_id'] as String,
      professionalId: json['professional_id'] as String?,
      serviceId: json['service_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      address: json['address'] as String,
      city: json['city'] as String,
      postalCode: json['postal_code'] as String,
      status: JobStatus.values.byName(json['status'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
      scheduledAt: json['scheduled_at'] != null
          ? DateTime.parse(json['scheduled_at'] as String)
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      estimatedPrice: (json['estimated_price'] as num?)?.toDouble(),
      finalPrice: (json['final_price'] as num?)?.toDouble(),
      photos: (json['photos'] as List?)?.cast<String>() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'customer_id': customerId,
        'professional_id': professionalId,
        'service_id': serviceId,
        'title': title,
        'description': description,
        'address': address,
        'city': city,
        'postal_code': postalCode,
        'status': status.name,
        'created_at': createdAt.toIso8601String(),
        'scheduled_at': scheduledAt?.toIso8601String(),
        'completed_at': completedAt?.toIso8601String(),
        'estimated_price': estimatedPrice,
        'final_price': finalPrice,
        'photos': photos,
      };

  Job copyWith({
    String? professionalId,
    JobStatus? status,
    DateTime? scheduledAt,
    DateTime? completedAt,
    double? estimatedPrice,
    double? finalPrice,
  }) {
    return Job(
      id: id,
      customerId: customerId,
      professionalId: professionalId ?? this.professionalId,
      serviceId: serviceId,
      title: title,
      description: description,
      address: address,
      city: city,
      postalCode: postalCode,
      status: status ?? this.status,
      createdAt: createdAt,
      scheduledAt: scheduledAt ?? this.scheduledAt,
      completedAt: completedAt ?? this.completedAt,
      estimatedPrice: estimatedPrice ?? this.estimatedPrice,
      finalPrice: finalPrice ?? this.finalPrice,
      photos: photos,
    );
  }

  bool get isActionable =>
      status == JobStatus.pending || status == JobStatus.accepted;

  String get statusLabel {
    switch (status) {
      case JobStatus.pending:
        return 'Nieuw';
      case JobStatus.accepted:
        return 'Geaccepteerd';
      case JobStatus.inProgress:
        return 'Bezig';
      case JobStatus.completed:
        return 'Afgerond';
      case JobStatus.cancelled:
        return 'Geannuleerd';
      case JobStatus.rejected:
        return 'Afgewezen';
    }
  }
}
