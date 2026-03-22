import 'package:flutter/material.dart';
import '../../models/professional.dart';
import '../../models/service.dart';
import '../../services/api_service.dart';

class ProfessionalProfileScreen extends StatefulWidget {
  final String professionalId;

  const ProfessionalProfileScreen({super.key, required this.professionalId});

  @override
  State<ProfessionalProfileScreen> createState() =>
      _ProfessionalProfileScreenState();
}

class _ProfessionalProfileScreenState extends State<ProfessionalProfileScreen> {
  final ApiService _api = ApiService();
  final _formKey = GlobalKey<FormState>();

  Professional? _profile;
  bool _loading = true;
  bool _saving = false;

  late TextEditingController _businessNameCtrl;
  late TextEditingController _descriptionCtrl;
  late TextEditingController _regionCtrl;
  late TextEditingController _hourlyRateCtrl;

  @override
  void initState() {
    super.initState();
    _businessNameCtrl = TextEditingController();
    _descriptionCtrl = TextEditingController();
    _regionCtrl = TextEditingController();
    _hourlyRateCtrl = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _businessNameCtrl.dispose();
    _descriptionCtrl.dispose();
    _regionCtrl.dispose();
    _hourlyRateCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _loading = true);
    try {
      final response = await _api.get(
          '/professionals/${widget.professionalId}');
      final profile =
          Professional.fromJson(response as Map<String, dynamic>);
      setState(() {
        _profile = profile;
        _businessNameCtrl.text = profile.businessName;
        _descriptionCtrl.text = profile.description;
        _regionCtrl.text = profile.region;
        _hourlyRateCtrl.text = profile.hourlyRate.toStringAsFixed(2);
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fout bij laden profiel: $e')),
        );
      }
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);
    try {
      await _api.put('/professionals/${widget.professionalId}', {
        'business_name': _businessNameCtrl.text.trim(),
        'description': _descriptionCtrl.text.trim(),
        'region': _regionCtrl.text.trim(),
        'hourly_rate': double.parse(_hourlyRateCtrl.text),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profiel opgeslagen!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fout: $e')),
        );
      }
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mijn profiel'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          if (!_loading)
            TextButton(
              onPressed: _saving ? null : _saveProfile,
              child: Text(
                _saving ? 'Opslaan...' : 'Opslaan',
                style: const TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _buildForm(),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Stats header
          if (_profile != null) _buildStatsHeader(),
          const SizedBox(height: 24),

          // Business info
          TextFormField(
            controller: _businessNameCtrl,
            decoration: const InputDecoration(
              labelText: 'Bedrijfsnaam',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.business),
            ),
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'Verplicht veld' : null,
          ),
          const SizedBox(height: 16),

          TextFormField(
            controller: _descriptionCtrl,
            decoration: const InputDecoration(
              labelText: 'Omschrijving',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.description),
            ),
            maxLines: 4,
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'Verplicht veld' : null,
          ),
          const SizedBox(height: 16),

          TextFormField(
            controller: _regionCtrl,
            decoration: const InputDecoration(
              labelText: 'Regio',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.map),
            ),
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'Verplicht veld' : null,
          ),
          const SizedBox(height: 16),

          TextFormField(
            controller: _hourlyRateCtrl,
            decoration: const InputDecoration(
              labelText: 'Uurtarief',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.euro),
              suffixText: '/ uur',
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Verplicht veld';
              if (double.tryParse(v) == null) return 'Ongeldig bedrag';
              return null;
            },
          ),
          const SizedBox(height: 24),

          // Services
          const Text('Diensten',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ServiceCategory.defaultCategories().map((s) {
              final isActive =
                  _profile?.services.any((ps) => ps.id == s.id) ?? false;
              return FilterChip(
                label: Text(s.name),
                selected: isActive,
                onSelected: (_) {
                  // Toggle service in profile (local only for now)
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // Verification badge
          if (_profile != null)
            Card(
              child: ListTile(
                leading: Icon(
                  _profile!.isVerified
                      ? Icons.verified
                      : Icons.verified_outlined,
                  color: _profile!.isVerified ? Colors.blue : Colors.grey,
                ),
                title: Text(_profile!.isVerified
                    ? 'Geverifieerd'
                    : 'Niet geverifieerd'),
                subtitle: Text(_profile!.isVerified
                    ? 'Je profiel is geverifieerd'
                    : 'Upload KvK-uittreksel om te verifiëren'),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatsHeader() {
    final p = _profile!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _statItem(Icons.star, p.rating.toStringAsFixed(1), 'Beoordeling'),
            _statItem(Icons.handyman, '${p.completedJobs}', 'Klussen'),
            _statItem(Icons.euro, '${p.hourlyRate.round()}', 'Uurtarief'),
          ],
        ),
      ),
    );
  }

  Widget _statItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: Theme.of(context).colorScheme.primary),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
      ],
    );
  }
}
