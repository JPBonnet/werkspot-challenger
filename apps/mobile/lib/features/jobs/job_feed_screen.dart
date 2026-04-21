import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final _currency = NumberFormat.currency(locale: 'nl_NL', symbol: '€');

final jobsFeedProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final rows = await Supabase.instance.client
      .from('jobs')
      .select('id, title, description, postal_code, city, estimated_price_cents, status, urgency, created_at')
      .eq('status', 'pending')
      .order('created_at', ascending: false)
      .limit(50);
  return List<Map<String, dynamic>>.from(rows);
});

class JobFeedScreen extends ConsumerWidget {
  const JobFeedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobs = ref.watch(jobsFeedProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Beschikbare klussen'),
        actions: [
          IconButton(onPressed: () => context.go('/profile'), icon: const Icon(Icons.person_outline)),
        ],
      ),
      body: jobs.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Fout: $err')),
        data: (items) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(jobsFeedProvider),
          child: items.isEmpty
              ? ListView(children: const [
                  SizedBox(height: 120),
                  Center(child: Text('Nog geen klussen in jouw gebied.')),
                ])
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final job = items[i];
                    final price = job['estimated_price_cents'] != null
                        ? _currency.format((job['estimated_price_cents'] as int) / 100)
                        : 'Prijs n.t.b.';
                    return Card(
                      child: ListTile(
                        title: Text(job['title'] ?? ''),
                        subtitle: Text('${job['city'] ?? ''} · $price'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.go('/jobs/${job['id']}'),
                      ),
                    );
                  },
                ),
        ),
      ),
    );
  }
}
