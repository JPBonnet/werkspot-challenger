import '../models/job.dart';
import 'api_service.dart';

class JobService {
  final ApiService _api = ApiService();

  Future<List<Job>> getAvailableJobs({String? serviceId, String? city}) async {
    final query = StringBuffer('/jobs?status=pending');
    if (serviceId != null) query.write('&service_id=$serviceId');
    if (city != null) query.write('&city=$city');

    final response = await _api.get(query.toString());
    final items = response['data'] as List;
    return items
        .map((j) => Job.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<List<Job>> getMyJobs(String professionalId) async {
    final response =
        await _api.get('/jobs?professional_id=$professionalId');
    final items = response['data'] as List;
    return items
        .map((j) => Job.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<Job> getJob(String jobId) async {
    final response = await _api.get('/jobs/$jobId');
    return Job.fromJson(response as Map<String, dynamic>);
  }

  Future<Job> acceptJob(String jobId, String professionalId,
      {double? estimatedPrice, DateTime? scheduledAt}) async {
    final response = await _api.patch('/jobs/$jobId', {
      'professional_id': professionalId,
      'status': JobStatus.accepted.name,
      if (estimatedPrice != null) 'estimated_price': estimatedPrice,
      if (scheduledAt != null) 'scheduled_at': scheduledAt.toIso8601String(),
    });
    return Job.fromJson(response as Map<String, dynamic>);
  }

  Future<Job> rejectJob(String jobId) async {
    final response = await _api.patch('/jobs/$jobId', {
      'status': JobStatus.rejected.name,
    });
    return Job.fromJson(response as Map<String, dynamic>);
  }

  Future<Job> startJob(String jobId) async {
    final response = await _api.patch('/jobs/$jobId', {
      'status': JobStatus.inProgress.name,
    });
    return Job.fromJson(response as Map<String, dynamic>);
  }

  Future<Job> completeJob(String jobId, {required double finalPrice}) async {
    final response = await _api.patch('/jobs/$jobId', {
      'status': JobStatus.completed.name,
      'final_price': finalPrice,
      'completed_at': DateTime.now().toIso8601String(),
    });
    return Job.fromJson(response as Map<String, dynamic>);
  }

  Future<Job> cancelJob(String jobId) async {
    final response = await _api.patch('/jobs/$jobId', {
      'status': JobStatus.cancelled.name,
    });
    return Job.fromJson(response as Map<String, dynamic>);
  }
}
