import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '../../services/jobStore';
import { formatCurrency } from '../../services/paymentService';
import { ProfessionalService, Professional } from '../../models/Job';

const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return { label: d.toLocaleDateString('en-NL', { weekday: 'short', month: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] };
});

export default function BookJobScreen({ route, navigation }: any) {
  const { professional, service }: { professional: Professional; service: ProfessionalService } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [budget, setBudget] = useState(service.priceFrom);
  const { bookJob, isLoading } = useJobStore();

  const tax = budget * 0.21;
  const total = budget + tax;

  const handleBook = async () => {
    if (!selectedDate) return Alert.alert('Select Date', 'Please select a preferred date.');
    if (!location.trim()) return Alert.alert('Enter Location', 'Please enter your address.');

    try {
      await bookJob({
        professionalId: professional.id,
        serviceId: service.id,
        date: selectedDate,
        location: location.trim(),
        budget,
      });
      navigation.navigate('Payment', {
        professional, service, budget, tax, total, jobId: `j${Date.now()}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to book job. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A3A52" />
        </TouchableOpacity>

        <Text style={styles.title}>Book Service</Text>

        <View style={styles.proCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{professional.name[0]}</Text></View>
          <View>
            <Text style={styles.proName}>{professional.name}</Text>
            <Text style={styles.serviceName}>{service.name}</Text>
          </View>
        </View>

        <Text style={styles.label}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {DATES.map(d => (
            <TouchableOpacity key={d.value} style={[styles.dateBtn, selectedDate === d.value && styles.dateActive]}
              onPress={() => setSelectedDate(d.value)}>
              <Text style={[styles.dateText, selectedDate === d.value && styles.dateActiveText]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Your Address</Text>
        <TextInput style={styles.input} placeholder="Street, City" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Additional Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the job details..." value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

        <Text style={styles.label}>Budget</Text>
        <View style={styles.budgetRow}>
          <TouchableOpacity style={styles.budgetBtn} onPress={() => setBudget(Math.max(service.priceFrom, budget - 10))}>
            <Ionicons name="remove" size={20} color="#1A3A52" />
          </TouchableOpacity>
          <Text style={styles.budgetAmount}>{formatCurrency(budget)}</Text>
          <TouchableOpacity style={styles.budgetBtn} onPress={() => setBudget(Math.min(service.priceTo, budget + 10))}>
            <Ionicons name="add" size={20} color="#1A3A52" />
          </TouchableOpacity>
        </View>
        <Text style={styles.budgetRange}>Range: {formatCurrency(service.priceFrom)} - {formatCurrency(service.priceTo)}</Text>

        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Service</Text><Text style={styles.priceValue}>{formatCurrency(budget)}</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Tax (21% BTW)</Text><Text style={styles.priceValue}>{formatCurrency(tax)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.priceRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{formatCurrency(total)}</Text></View>
        </View>

        <TouchableOpacity style={[styles.bookBtn, isLoading && { opacity: 0.6 }]} onPress={handleBook} disabled={isLoading}>
          <Text style={styles.bookBtnText}>{isLoading ? 'Booking...' : 'Continue to Payment'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backBtn: { padding: 16, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A3A52', paddingHorizontal: 16, marginTop: 8, marginBottom: 16 },
  proCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', marginHorizontal: 16, padding: 14, borderRadius: 10, marginBottom: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A3A52', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  proName: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  serviceName: { fontSize: 14, color: '#D4A574', marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A3A52', paddingHorizontal: 16, marginBottom: 8, marginTop: 16 },
  dateScroll: { paddingLeft: 16, marginBottom: 8 },
  dateBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f5f5f5', borderRadius: 8, marginRight: 8 },
  dateActive: { backgroundColor: '#1A3A52' },
  dateText: { fontSize: 13, color: '#666' },
  dateActiveText: { color: '#fff' },
  input: { backgroundColor: '#f5f5f5', marginHorizontal: 16, borderRadius: 8, padding: 14, fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16 },
  budgetBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  budgetAmount: { fontSize: 28, fontWeight: 'bold', color: '#1A3A52', marginHorizontal: 24 },
  budgetRange: { textAlign: 'center', fontSize: 12, color: '#999', marginTop: 4 },
  priceBreakdown: { backgroundColor: '#f5f5f5', marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 14, color: '#666' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1A3A52' },
  bookBtn: { backgroundColor: '#1A3A52', marginHorizontal: 16, marginVertical: 24, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
