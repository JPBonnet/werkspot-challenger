import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final _currency = NumberFormat.currency(locale: 'nl_NL', symbol: '€');

final jobDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, id) async {
  final row = await Supabase.instance.client
      .from('jobs')
      .select('id, title, description, address_line, city, postal_code, status, urgency, estimated_price_cents, ai_quote_range_min_cents, ai_quote_range_max_cents, photos, created_at')
      .eq('id', id)
      .single();
  return Map<String, dynamic>.from(row);
});

class JobDetailScreen extends ConsumerWidget {
  const JobDetailScreen({super.key, required this.jobId});
  final String jobId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final job = ref.watch(jobDetailProvider(jobId));
    return Scaffold(
      appBar: AppBar(title: const Text('Klus')),
      body: job.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Fout: $err')),
        data: (j) {
          final range = j['ai_quote_range_min_cents'] != null && j['ai_quote_range_max_cents'] != null
              ? '${_currency.format((j['ai_quote_range_min_cents'] as int) / 100)} – ${_currency.format((j['ai_quote_range_max_cents'] as int) / 100)}'
              : null;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(j['title'] ?? '', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text('${j['city'] ?? ''} · ${j['postal_code'] ?? ''}',
                  style: Theme.of(context).textTheme.bodyMedium),
              if (range != null) ...[
                const SizedBox(height: 16),
                Chip(label: Text('AI inschatting: $range')),
              ],
              const SizedBox(height: 24),
              Text(j['description'] ?? '', style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 32),
              FilledButton.icon(
                onPressed: () => _acceptJob(context, ref, j['id'] as String),
                icon: const Icon(Icons.check),
                label: const Text('Klus accepteren'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _acceptJob(BuildContext context, WidgetRef ref, String id) async {
    try {
      final me = Supabase.instance.client.auth.currentUser;
      if (me == null) throw Exception('Niet ingelogd');
      final pro = await Supabase.instance.client
          .from('professionals')
          .select('id')
          .eq('profile_id', me.id)
          .single();
      await Supabase.instance.client
          .from('jobs')
          .update({'status': 'accepted', 'professional_id': pro['id']})
          .eq('id', id);
      await Supabase.instance.client.from('job_events').insert({
        'job_id': id,
        'actor_id': me.id,
        'event_type': 'accepted',
        'payload': {},
      });
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Klus geaccepteerd.')));
      ref.invalidate(jobDetailProvider(id));
    } catch (err) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Fout: $err')));
    }
  }
}
