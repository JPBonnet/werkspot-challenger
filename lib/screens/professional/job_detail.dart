import 'package:flutter/material.dart';
import '../../models/job.dart';
import '../../services/job_service.dart';
import '../../services/payment_service.dart';

class JobDetailScreen extends StatefulWidget {
  final String jobId;
  final String professionalId;

  const JobDetailScreen({
    super.key,
    required this.jobId,
    required this.professionalId,
  });

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final JobService _jobService = JobService();
  final PaymentService _paymentService = PaymentService();

  Job? _job;
  bool _loading = true;
  bool _actionInProgress = false;

  @override
  void initState() {
    super.initState();
    _loadJob();
  }

  Future<void> _loadJob() async {
    setState(() => _loading = true);
    try {
      final job = await _jobService.getJob(widget.jobId);
      setState(() {
        _job = job;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fout: $e')),
        );
      }
    }
  }

  Future<void> _acceptJob() async {
    setState(() => _actionInProgress = true);
    try {
      final job = await _jobService.acceptJob(
        widget.jobId,
        widget.professionalId,
      );
      setState(() {
        _job = job;
        _actionInProgress = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Klus geaccepteerd!')),
        );
      }
    } catch (e) {
      setState(() => _actionInProgress = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fout: $e')),
        );
      }
    }
  }

  Future<void> _rejectJob() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Klus afwijzen'),
        content: const Text('Weet je zeker dat je deze klus wilt afwijzen?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuleren'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Afwijzen', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _actionInProgress = true);
    try {
      final job = await _jobService.rejectJob(widget.jobId);
      setState(() {
        _job = job;
        _actionInProgress = false;
      });
    } catch (e) {
      setState(() => _actionInProgress = false);
    }
  }

  Future<void> _startJob() async {
    setState(() => _actionInProgress = true);
    try {
      final job = await _jobService.startJob(widget.jobId);
      setState(() {
        _job = job;
        _actionInProgress = false;
      });
    } catch (e) {
      setState(() => _actionInProgress = false);
    }
  }

  Future<void> _completeJob() async {
    final priceController = TextEditingController(
      text: _job?.estimatedPrice?.toStringAsFixed(2) ?? '',
    );

    final price = await showDialog<double>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Klus afronden'),
        content: TextField(
          controller: priceController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            labelText: 'Eindbedrag (€)',
            prefixText: '€ ',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuleren'),
          ),
          TextButton(
            onPressed: () {
              final value = double.tryParse(priceController.text);
              Navigator.pop(ctx, value);
            },
            child: const Text('Afronden'),
          ),
        ],
      ),
    );

    if (price == null) return;

    setState(() => _actionInProgress = true);
    try {
      final job = await _jobService.completeJob(widget.jobId, finalPrice: price);
      setState(() {
        _job = job;
        _actionInProgress = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Klus afgerond!')),
        );
      }
    } catch (e) {
      setState(() => _actionInProgress = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_job?.title ?? 'Klus details'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _job == null
              ? const Center(child: Text('Klus niet gevonden'))
              : _buildContent(),
      bottomNavigationBar: _job != null && _job!.isActionable
          ? _buildActions()
          : null,
    );
  }

  Widget _buildContent() {
    final job = _job!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _statusColor(job.status).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(_statusIcon(job.status),
                    color: _statusColor(job.status)),
                const SizedBox(width: 8),
                Text(
                  job.statusLabel,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: _statusColor(job.status),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Description
          const Text('Omschrijving',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Text(job.description),
          const SizedBox(height: 20),

          // Location
          const Text('Locatie',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          ListTile(
            leading: const Icon(Icons.location_on),
            title: Text(job.address),
            subtitle: Text('${job.postalCode} ${job.city}'),
            contentPadding: EdgeInsets.zero,
          ),
          const Divider(),

          // Pricing
          if (job.estimatedPrice != null || job.finalPrice != null) ...[
            const Text('Prijs',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            if (job.estimatedPrice != null)
              _infoRow('Geschat',
                  _paymentService.formatPrice(job.estimatedPrice!)),
            if (job.finalPrice != null)
              _infoRow(
                  'Eindbedrag', _paymentService.formatPrice(job.finalPrice!)),
            const Divider(),
          ],

          // Schedule
          if (job.scheduledAt != null) ...[
            const Text('Planning',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.calendar_today),
              title: Text(_formatDate(job.scheduledAt!)),
              contentPadding: EdgeInsets.zero,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildActions() {
    final job = _job!;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: _actionInProgress
            ? const Center(child: CircularProgressIndicator())
            : Row(
                children: [
                  if (job.status == JobStatus.pending) ...[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _rejectJob,
                        style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red),
                        child: const Text('Afwijzen'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: FilledButton(
                        onPressed: _acceptJob,
                        child: const Text('Accepteren'),
                      ),
                    ),
                  ] else if (job.status == JobStatus.accepted) ...[
                    Expanded(
                      child: FilledButton(
                        onPressed: _startJob,
                        child: const Text('Start klus'),
                      ),
                    ),
                  ] else if (job.status == JobStatus.inProgress) ...[
                    Expanded(
                      child: FilledButton(
                        onPressed: _completeJob,
                        style:
                            FilledButton.styleFrom(backgroundColor: Colors.green),
                        child: const Text('Afronden'),
                      ),
                    ),
                  ],
                ],
              ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Color _statusColor(JobStatus status) {
    switch (status) {
      case JobStatus.pending:
        return Colors.orange;
      case JobStatus.accepted:
        return Colors.blue;
      case JobStatus.inProgress:
        return Colors.indigo;
      case JobStatus.completed:
        return Colors.green;
      case JobStatus.cancelled:
        return Colors.grey;
      case JobStatus.rejected:
        return Colors.red;
    }
  }

  IconData _statusIcon(JobStatus status) {
    switch (status) {
      case JobStatus.pending:
        return Icons.schedule;
      case JobStatus.accepted:
        return Icons.check_circle_outline;
      case JobStatus.inProgress:
        return Icons.engineering;
      case JobStatus.completed:
        return Icons.done_all;
      case JobStatus.cancelled:
        return Icons.cancel;
      case JobStatus.rejected:
        return Icons.block;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}-${date.month}-${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
