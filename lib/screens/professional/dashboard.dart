import 'package:flutter/material.dart';
import '../../models/job.dart';
import '../../services/job_service.dart';
import '../../services/payment_service.dart';
import 'job_detail.dart';
import 'profile.dart';

class ProfessionalDashboard extends StatefulWidget {
  final String professionalId;

  const ProfessionalDashboard({super.key, required this.professionalId});

  @override
  State<ProfessionalDashboard> createState() => _ProfessionalDashboardState();
}

class _ProfessionalDashboardState extends State<ProfessionalDashboard>
    with SingleTickerProviderStateMixin {
  final JobService _jobService = JobService();
  final PaymentService _paymentService = PaymentService();
  late TabController _tabController;

  List<Job> _availableJobs = [];
  List<Job> _myJobs = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadJobs();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadJobs() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _jobService.getAvailableJobs(),
        _jobService.getMyJobs(widget.professionalId),
      ]);
      setState(() {
        _availableJobs = results[0];
        _myJobs = results[1];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Werkspot Pro'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProfessionalProfileScreen(
                    professionalId: widget.professionalId),
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: [
            Tab(text: 'Beschikbaar (${_availableJobs.length})'),
            Tab(text: 'Mijn klussen (${_myJobs.length})'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildError()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildJobList(_availableJobs, isAvailable: true),
                    _buildJobList(_myJobs, isAvailable: false),
                  ],
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadJobs,
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(_error!, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadJobs, child: const Text('Opnieuw')),
        ],
      ),
    );
  }

  Widget _buildJobList(List<Job> jobs, {required bool isAvailable}) {
    if (jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isAvailable ? Icons.search_off : Icons.work_off,
              size: 64,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              isAvailable
                  ? 'Geen beschikbare klussen'
                  : 'Nog geen klussen aangenomen',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadJobs,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: jobs.length,
        itemBuilder: (context, index) => _buildJobCard(jobs[index]),
      ),
    );
  }

  Widget _buildJobCard(Job job) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: InkWell(
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => JobDetailScreen(
                jobId: job.id,
                professionalId: widget.professionalId,
              ),
            ),
          );
          _loadJobs();
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      job.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  _buildStatusChip(job.status),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                job.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text('${job.city}, ${job.postalCode}'),
                  const Spacer(),
                  if (job.estimatedPrice != null) ...[
                    const Icon(Icons.euro, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(_paymentService.formatPrice(job.estimatedPrice!)),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(JobStatus status) {
    final colors = {
      JobStatus.pending: Colors.orange,
      JobStatus.accepted: Colors.blue,
      JobStatus.inProgress: Colors.indigo,
      JobStatus.completed: Colors.green,
      JobStatus.cancelled: Colors.grey,
      JobStatus.rejected: Colors.red,
    };

    return Chip(
      label: Text(
        status.name.toUpperCase(),
        style: const TextStyle(fontSize: 11, color: Colors.white),
      ),
      backgroundColor: colors[status],
      padding: EdgeInsets.zero,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
