import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await apiClient.get('/api/professional/earnings');
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1A3A52" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Earnings Dashboard</Text>
      {earnings && (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>This Month</Text>
            <Text style={styles.amount}>€{earnings.thisMonth}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Total Earnings</Text>
            <Text style={styles.amount}>€{earnings.total}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Completed Jobs</Text>
            <Text style={styles.amount}>{earnings.completedJobs}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Commission Rate</Text>
            <Text style={styles.amount}>15%</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1A3A52' },
  card: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 12 },
  label: { fontSize: 12, color: '#999', marginBottom: 4 },
  amount: { fontSize: 24, fontWeight: 'bold', color: '#1A3A52' },
});
