class ServiceCategory {
  final String id;
  final String name;
  final String slug;
  final String icon;
  final String? parentId;

  const ServiceCategory({
    required this.id,
    required this.name,
    required this.slug,
    required this.icon,
    this.parentId,
  });

  factory ServiceCategory.fromJson(Map<String, dynamic> json) {
    return ServiceCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      icon: json['icon'] as String,
      parentId: json['parent_id'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'icon': icon,
        'parent_id': parentId,
      };

  static List<ServiceCategory> defaultCategories() {
    return const [
      ServiceCategory(id: '1', name: 'Loodgieter', slug: 'plumbing', icon: 'plumbing'),
      ServiceCategory(id: '2', name: 'Elektricien', slug: 'electrical', icon: 'electrical_services'),
      ServiceCategory(id: '3', name: 'Schilder', slug: 'painting', icon: 'format_paint'),
      ServiceCategory(id: '4', name: 'Timmerman', slug: 'carpentry', icon: 'carpenter'),
      ServiceCategory(id: '5', name: 'Dakdekker', slug: 'roofing', icon: 'roofing'),
      ServiceCategory(id: '6', name: 'Schoonmaak', slug: 'cleaning', icon: 'cleaning_services'),
      ServiceCategory(id: '7', name: 'Tuinman', slug: 'gardening', icon: 'yard'),
      ServiceCategory(id: '8', name: 'Verhuizer', slug: 'moving', icon: 'local_shipping'),
    ];
  }
}
