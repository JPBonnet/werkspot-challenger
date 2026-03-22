import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '../../services/jobStore';
import { Professional } from '../../models/Job';
import { formatCurrency } from '../../services/paymentService';

const MOCK_REVIEWS = [
  { id: 'r1', customerName: 'Maria L.', rating: 5, comment: 'Excellent work, very professional and on time!', createdAt: '2026-03-15' },
  { id: 'r2', customerName: 'Thomas B.', rating: 4, comment: 'Good job, would recommend.', createdAt: '2026-03-10' },
  { id: 'r3', customerName: 'Anna K.', rating: 5, comment: 'Fixed everything perfectly. Fair price too.', createdAt: '2026-02-28' },
];

export default function ProfessionalProfileScreen({ route, navigation }: any) {
  const { professionalId } = route.params;
  const [professional, setProfessional] = useState<Professional | null>(null);
  const { fetchProfessional } = useJobStore();

  useEffect(() => {
    fetchProfessional(professionalId).then(setProfessional);
  }, [professionalId]);

  if (!professional) return <ActivityIndicator size="large" color="#1A3A52" style={{ flex: 1 }} />;

  const renderStars = (rating: number) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'} size={16} color="#D4A574" />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A3A52" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{professional.name[0]}</Text>
          </View>
          <Text style={styles.name}>{professional.name}</Text>
          <View style={styles.ratingRow}>
            {renderStars(professional.rating)}
            <Text style={styles.ratingNum}>{professional.rating}</Text>
            <Text style={styles.reviewCount}>({professional.reviewCount} reviews)</Text>
          </View>
          <Text style={styles.location}><Ionicons name="location" size={14} color="#999" /> {professional.location}</Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{professional.bio}</Text>

        <Text style={styles.sectionTitle}>Services</Text>
        {professional.services.map(service => (
          <TouchableOpacity key={service.id} style={styles.serviceCard}
            onPress={() => navigation.navigate('BookJob', { professional, service })}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc}>{service.description}</Text>
              <Text style={styles.serviceDuration}>{service.duration}</Text>
            </View>
            <View style={styles.servicePrice}>
              <Text style={styles.priceText}>{formatCurrency(service.priceFrom)} - {formatCurrency(service.priceTo)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#1A3A52" />
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Reviews</Text>
        {MOCK_REVIEWS.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.customerName}</Text>
              {renderStars(review.rating)}
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
            <Text style={styles.reviewDate}>{review.createdAt}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.requestBtn}
          onPress={() => navigation.navigate('BookJob', { professional, service: professional.services[0] })}>
          <Text style={styles.requestBtnText}>Request Job</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backBtn: { padding: 16, paddingBottom: 0 },
  header: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A3A52', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1A3A52' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stars: { flexDirection: 'row' },
  ratingNum: { fontSize: 16, fontWeight: '600', color: '#1A3A52', marginLeft: 8 },
  reviewCount: { fontSize: 14, color: '#999', marginLeft: 4 },
  location: { fontSize: 14, color: '#999', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A3A52', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  bio: { fontSize: 15, color: '#666', paddingHorizontal: 16, lineHeight: 22 },
  serviceCard: { flexDirection: 'row', backgroundColor: '#f5f5f5', marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14, alignItems: 'center' },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1A3A52' },
  serviceDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  serviceDuration: { fontSize: 12, color: '#999', marginTop: 4 },
  servicePrice: { alignItems: 'flex-end' },
  priceText: { fontSize: 14, fontWeight: '600', color: '#D4A574', marginBottom: 4 },
  reviewCard: { backgroundColor: '#f5f5f5', marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#1A3A52' },
  reviewText: { fontSize: 14, color: '#666', lineHeight: 20 },
  reviewDate: { fontSize: 12, color: '#999', marginTop: 6 },
  requestBtn: { backgroundColor: '#1A3A52', marginHorizontal: 16, marginVertical: 24, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  requestBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
