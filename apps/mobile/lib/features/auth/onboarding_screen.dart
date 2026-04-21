import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 48, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Werkspot Challenger', style: theme.textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                'Vakmensen voor jouw klus. Eerlijk en snel betaald.',
                style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
              ),
              const Spacer(),
              _bullet(context, 'Geen leadkosten', 'Alleen 10% commissie op afgeronde klussen.'),
              const SizedBox(height: 16),
              _bullet(context, 'Veilige escrow-betalingen', 'Geld pas vrij als jij tevreden bent.'),
              const SizedBox(height: 16),
              _bullet(context, 'AI helpt', 'Post met je stem. Krijg een AI-prijsinschatting uit foto\'s.'),
              const Spacer(),
              FilledButton(
                onPressed: () => context.go('/register'),
                child: const Text('Aan de slag'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go('/login'),
                child: const Text('Ik heb al een account'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bullet(BuildContext context, String title, String body) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.check_circle, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              Text(body, style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
        ),
      ],
    );
  }
}
