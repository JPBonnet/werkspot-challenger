import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '../../services/jobStore';

export default function ReviewScreen({ route, navigation }: any) {
  const { jobId, professionalId, professionalName, serviceName } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { submitReview } = useJobStore();

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert('Rate', 'Please select a star rating.');
    try {
      await submitReview({ jobId, professionalId, rating, comment });
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'Failed to submit review.');
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.thankTitle}>Thank You!</Text>
          <Text style={styles.thankSub}>Your review has been submitted</Text>
          <View style={styles.submittedStars}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={28} color="#D4A574" />
            ))}
          </View>
          {comment ? <Text style={styles.submittedComment}>"{comment}"</Text> : null}
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('MyJobs')}>
            <Text style={styles.doneBtnText}>Back to My Jobs</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1A3A52" />
      </TouchableOpacity>

      <Text style={styles.title}>Leave a Review</Text>

      <View style={styles.proCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{professionalName[0]}</Text></View>
        <View>
          <Text style={styles.proName}>{professionalName}</Text>
          <Text style={styles.serviceText}>{serviceName}</Text>
        </View>
      </View>

      <Text style={styles.label}>How was the service?</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(i => (
          <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starBtn}>
            <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={40} color="#D4A574" />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingLabel}>
        {rating === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
      </Text>

      <Text style={styles.label}>Write a review (optional)</Text>
      <TextInput style={styles.textArea} placeholder="Share your experience..."
        value={comment} onChangeText={setComment} multiline numberOfLines={4} maxLength={500} />
      <Text style={styles.charCount}>{comment.length}/500</Text>

      <TouchableOpacity style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]} onPress={handleSubmit} disabled={rating === 0}>
        <Text style={styles.submitBtnText}>Submit Review</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  backBtn: { padding: 16, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A3A52', paddingHorizontal: 16, marginTop: 8, marginBottom: 20 },
  proCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', marginHorizontal: 16, padding: 14, borderRadius: 10, marginBottom: 24 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A3A52', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  proName: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  serviceText: { fontSize: 14, color: '#D4A574', marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A3A52', paddingHorizontal: 16, marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starBtn: { padding: 4 },
  ratingLabel: { textAlign: 'center', fontSize: 15, color: '#666', marginBottom: 24 },
  textArea: { backgroundColor: '#f5f5f5', marginHorizontal: 16, borderRadius: 8, padding: 14, fontSize: 15, height: 120, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', paddingHorizontal: 16, fontSize: 12, color: '#999', marginTop: 4 },
  submitBtn: { backgroundColor: '#1A3A52', marginHorizontal: 16, marginTop: 24, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  thankTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A3A52', marginTop: 16, marginBottom: 4 },
  thankSub: { fontSize: 15, color: '#666', marginBottom: 16 },
  submittedStars: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  submittedComment: { fontSize: 15, color: '#666', fontStyle: 'italic', textAlign: 'center', marginBottom: 24, paddingHorizontal: 24 },
  doneBtn: { backgroundColor: '#1A3A52', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 8 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
