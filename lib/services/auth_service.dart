import 'dart:convert';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();
  User? _currentUser;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  Future<User> login(String email, String password) async {
    final response = await _api.post('/auth/login', {
      'email': email,
      'password': password,
    });

    final token = response['access_token'] as String;
    await _api.setToken(token);

    _currentUser = User.fromJson(response['user'] as Map<String, dynamic>);
    return _currentUser!;
  }

  Future<User> register({
    required String email,
    required String password,
    required String fullName,
    required String phone,
    required UserRole role,
  }) async {
    final response = await _api.post('/auth/register', {
      'email': email,
      'password': password,
      'full_name': fullName,
      'phone': phone,
      'role': role.name,
    });

    final token = response['access_token'] as String;
    await _api.setToken(token);

    _currentUser = User.fromJson(response['user'] as Map<String, dynamic>);
    return _currentUser!;
  }

  Future<void> logout() async {
    await _api.clearToken();
    _currentUser = null;
  }

  Future<User?> restoreSession() async {
    try {
      final response = await _api.get('/auth/me');
      _currentUser = User.fromJson(response as Map<String, dynamic>);
      return _currentUser;
    } catch (_) {
      await _api.clearToken();
      return null;
    }
  }

  Future<void> resetPassword(String email) async {
    await _api.post('/auth/reset-password', {'email': email});
  }

  /// Decode JWT payload without verification (for local checks only).
  Map<String, dynamic>? decodeTokenPayload(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = utf8.decode(
        base64Url.decode(base64Url.normalize(parts[1])),
      );
      return jsonDecode(payload) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }
}
