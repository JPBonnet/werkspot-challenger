import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Werkspot Challenger</Text>
          <Text style={styles.subtitle}>Fair marketplace for professionals</Text>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureTitle}>💰 Fair Commission</Text>
          <Text style={styles.featureText}>15% instead of 25% - Keep more of what you earn</Text>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureTitle}>🛠️ Professional Tools</Text>
          <Text style={styles.featureText}>Invoicing, scheduling, portfolio - all built-in</Text>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureTitle}>👥 Community</Text>
          <Text style={styles.featureText}>Connect with other professionals, share tips</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonSecondaryText}>Already a member?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A3A52', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#999' },
  feature: { marginBottom: 24 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#1A3A52', marginBottom: 4 },
  featureText: { fontSize: 14, color: '#666', lineHeight: 20 },
  buttonContainer: { gap: 12 },
  button: { backgroundColor: '#1A3A52', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonSecondary: { paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1A3A52', alignItems: 'center' },
  buttonSecondaryText: { color: '#1A3A52', fontSize: 14, fontWeight: '600' },
});
