import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '../../services/jobStore';
import { Job } from '../../models/Job';
import { formatCurrency } from '../../services/paymentService';

const STATUS_CONFIG: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  pending: { color: '#FF9800', icon: 'time', label: 'Pending' },
  confirmed: { color: '#2196F3', icon: 'checkmark-circle', label: 'Confirmed' },
  in_progress: { color: '#9C27B0', icon: 'construct', label: 'In Progress' },
  completed: { color: '#4CAF50', icon: 'checkmark-done-circle', label: 'Completed' },
  cancelled: { color: '#F44336', icon: 'close-circle', label: 'Cancelled' },
};

export default function MyJobsScreen({ navigation }: any) {
  const { jobs, isLoading, fetchMyJobs, cancelJob } = useJobStore();

  useEffect(() => { fetchMyJobs(); }, []);

  const handleCancel = (job: Job) => {
    Alert.alert('Cancel Job', `Cancel ${job.serviceType} with ${job.professionalName}?`, [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelJob(job.id) },
    ]);
  };

  const renderJob = ({ item }: { item: Job }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const canCancel = item.status === 'pending' || item.status === 'confirmed';
    const canReview = item.status === 'completed';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
            <Text style={styles.proName}>{item.professionalName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Ionicons name="calendar" size={14} color="#999" />
            <Text style={styles.detailText}>{item.scheduledDate}</Text>
          </View>
          <View style={styles.detail}>
            <Ionicons name="location" size={14} color="#999" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <Text style={styles.price}>{formatCurrency(item.total)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.msgBtn}
            onPress={() => navigation.navigate('Messaging', { professionalId: item.professionalId, professionalName: item.professionalName })}>
            <Ionicons name="chatbubble-outline" size={16} color="#1A3A52" />
            <Text style={styles.msgBtnText}>Message</Text>
          </TouchableOpacity>

          {canReview && (
            <TouchableOpacity style={styles.reviewBtn}
              onPress={() => navigation.navigate('Review', { jobId: item.id, professionalId: item.professionalId, professionalName: item.professionalName, serviceName: item.serviceType })}>
              <Ionicons name="star-outline" size={16} color="#D4A574" />
              <Text style={styles.reviewBtnText}>Review</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item)}>
              <Ionicons name="close" size={16} color="#F44336" />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Jobs</Text>
      {isLoading ? <ActivityIndicator size="large" color="#1A3A52" style={{ marginTop: 40 }} /> : (
        <FlatList data={jobs} keyExtractor={i => i.id} renderItem={renderJob}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No jobs yet</Text>
              <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search')}>
                <Text style={styles.searchBtnText}>Find Professionals</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A3A52', padding: 16, paddingBottom: 12 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  serviceType: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  proName: { fontSize: 14, color: '#666', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 13, color: '#999' },
  price: { fontSize: 15, fontWeight: '600', color: '#1A3A52', marginLeft: 'auto' },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 12 },
  msgBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fff' },
  msgBtnText: { fontSize: 13, color: '#1A3A52', fontWeight: '600' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fff' },
  reviewBtnText: { fontSize: 13, color: '#D4A574', fontWeight: '600' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fff', marginLeft: 'auto' },
  cancelBtnText: { fontSize: 13, color: '#F44336', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12, marginBottom: 16 },
  searchBtn: { backgroundColor: '#1A3A52', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  searchBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
