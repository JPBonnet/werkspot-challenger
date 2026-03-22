import 'api_service.dart';

enum PaymentStatus { pending, processing, succeeded, failed, refunded }

class PaymentIntent {
  final String id;
  final String jobId;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final String? stripePaymentIntentId;

  const PaymentIntent({
    required this.id,
    required this.jobId,
    required this.amount,
    this.currency = 'eur',
    required this.status,
    this.stripePaymentIntentId,
  });

  factory PaymentIntent.fromJson(Map<String, dynamic> json) {
    return PaymentIntent(
      id: json['id'] as String,
      jobId: json['job_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'eur',
      status: PaymentStatus.values.byName(json['status'] as String),
      stripePaymentIntentId: json['stripe_payment_intent_id'] as String?,
    );
  }
}

class PaymentService {
  final ApiService _api = ApiService();

  /// Create a payment intent for a completed job.
  Future<PaymentIntent> createPaymentIntent({
    required String jobId,
    required double amount,
  }) async {
    final response = await _api.post('/payments/intent', {
      'job_id': jobId,
      'amount': (amount * 100).round(), // cents
      'currency': 'eur',
    });
    return PaymentIntent.fromJson(response as Map<String, dynamic>);
  }

  /// Confirm payment after Stripe client-side confirmation.
  Future<PaymentIntent> confirmPayment(String paymentIntentId) async {
    final response =
        await _api.post('/payments/$paymentIntentId/confirm', {});
    return PaymentIntent.fromJson(response as Map<String, dynamic>);
  }

  /// Get payment history for a professional.
  Future<List<PaymentIntent>> getPaymentHistory(
      String professionalId) async {
    final response =
        await _api.get('/payments?professional_id=$professionalId');
    final items = response['data'] as List;
    return items
        .map((p) => PaymentIntent.fromJson(p as Map<String, dynamic>))
        .toList();
  }

  /// Request payout to professional's bank account.
  Future<void> requestPayout(String professionalId) async {
    await _api.post('/payments/payout', {
      'professional_id': professionalId,
    });
  }

  /// Format price for display (Dutch locale).
  String formatPrice(double amount) {
    return '€${amount.toStringAsFixed(2).replaceAll('.', ',')}';
  }
}
