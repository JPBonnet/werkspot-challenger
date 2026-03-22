import 'package:flutter/material.dart';
import 'screens/professional/dashboard.dart';

void main() {
  runApp(const WerkspotApp());
}

class WerkspotApp extends StatelessWidget {
  const WerkspotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Werkspot Challenger',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0066FF),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const ProfessionalDashboard(professionalId: 'demo-pro-1'),
    );
  }
}
