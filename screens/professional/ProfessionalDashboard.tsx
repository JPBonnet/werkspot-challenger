import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  status: 'open' | 'accepted' | 'completed';
  postedAt: string;
}

export default function ProfessionalDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/jobs');
      setJobs(response.data);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (jobId: string) => {
    try {
      await apiClient.post(`/api/jobs/${jobId}/accept`);
      fetchJobs();
    } catch (err) {
      setError('Failed to accept job');
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
      <Text style={styles.title}>Available Jobs</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobDescription}>{item.description}</Text>
            <Text style={styles.jobLocation}>📍 {item.location}</Text>
            <Text style={styles.jobBudget}>€{item.budget}</Text>
            {item.status === 'open' && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptJob(item.id)}
              >
                <Text style={styles.buttonText}>Accept Job</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1A3A52' },
  error: { color: 'red', marginBottom: 12 },
  jobCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A574',
  },
  jobTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  jobDescription: { fontSize: 14, color: '#666', marginBottom: 4 },
  jobLocation: { fontSize: 13, color: '#999', marginBottom: 8 },
  jobBudget: { fontSize: 14, fontWeight: 'bold', color: '#1A3A52', marginBottom: 12 },
  acceptButton: {
    backgroundColor: '#1A3A52',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
