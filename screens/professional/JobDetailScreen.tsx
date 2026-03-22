import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';

export default function JobDetailScreen({ route }: any) {
  const { jobId } = route.params;
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await apiClient.get(`/api/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to load job:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {job && (
          <>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.section}>Description</Text>
            <Text style={styles.text}>{job.description}</Text>
            <Text style={styles.section}>Location</Text>
            <Text style={styles.text}>{job.location}</Text>
            <Text style={styles.section}>Budget</Text>
            <Text style={styles.budget}>€{job.budget}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Accept & Start</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1A3A52' },
  section: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#1A3A52' },
  text: { fontSize: 14, color: '#666', lineHeight: 20 },
  budget: { fontSize: 18, fontWeight: 'bold', color: '#D4A574' },
  button: { backgroundColor: '#1A3A52', padding: 16, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
