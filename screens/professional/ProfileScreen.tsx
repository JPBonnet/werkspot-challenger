import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../services/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{user.userType}</Text>
        </>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1A3A52' },
  label: { fontSize: 12, color: '#999', marginTop: 16 },
  value: { fontSize: 16, color: '#1A3A52', marginBottom: 12 },
  logoutButton: { backgroundColor: '#ff6b6b', padding: 12, borderRadius: 6, marginTop: 24, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});
