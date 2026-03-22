import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '../../services/jobStore';
import { Professional } from '../../models/Job';

const FILTERS = ['All', '4+ Stars', 'Under €100', 'Available Now'];

export default function SearchProfessionalsScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { professionals, isLoading, searchProfessionals } = useJobStore();

  useEffect(() => {
    searchProfessionals('', '');
  }, []);

  const handleSearch = () => {
    const filters: { rating?: number; priceMax?: number } = {};
    if (activeFilter === '4+ Stars') filters.rating = 4;
    if (activeFilter === 'Under €100') filters.priceMax = 100;
    searchProfessionals(query, location, filters);
  };

  const renderProfessional = ({ item }: { item: Professional }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: item.id })}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.location}><Ionicons name="location" size={12} color="#999" /> {item.location}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#D4A574" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
      <View style={styles.servicesTags}>
        {item.services.slice(0, 3).map(s => (
          <View key={s.id} style={styles.tag}><Text style={styles.tagText}>{s.name}</Text></View>
        ))}
      </View>
      <Text style={styles.reviewCount}>{item.reviewCount} reviews</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Find Professionals</Text>
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput style={styles.input} placeholder="Service type..." value={query} onChangeText={setQuery} onSubmitEditing={handleSearch} />
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="location" size={18} color="#999" />
          <TextInput style={styles.input} placeholder="Location..." value={location} onChangeText={setLocation} onSubmitEditing={handleSearch} />
        </View>
      </View>

      <FlatList horizontal data={FILTERS} keyExtractor={i => i} showsHorizontalScrollIndicator={false} style={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.filterBtn, activeFilter === item && styles.filterActive]} onPress={() => { setActiveFilter(item); handleSearch(); }}>
            <Text style={[styles.filterText, activeFilter === item && styles.filterActiveText]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? <ActivityIndicator size="large" color="#1A3A52" style={{ marginTop: 40 }} /> : (
        <FlatList data={professionals} keyExtractor={i => i.id} renderItem={renderProfessional}
          ListEmptyComponent={<Text style={styles.empty}>No professionals found</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A3A52', marginBottom: 16 },
  searchRow: { gap: 8, marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  input: { flex: 1, marginLeft: 8, fontSize: 15 },
  filters: { maxHeight: 44, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 8 },
  filterActive: { backgroundColor: '#1A3A52' },
  filterText: { fontSize: 13, color: '#666' },
  filterActiveText: { color: '#fff' },
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A3A52', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  location: { fontSize: 13, color: '#999', marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#1A3A52', marginLeft: 4 },
  bio: { fontSize: 14, color: '#666', marginBottom: 8 },
  servicesTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tag: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, color: '#1A3A52' },
  reviewCount: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
