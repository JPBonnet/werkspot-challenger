import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '../../services/jobStore';
import { Conversation } from '../../models/Job';

export default function MessagingScreen({ navigation, route }: any) {
  const { conversations, fetchConversations } = useJobStore();

  // If navigated with specific professional, go directly to thread
  useEffect(() => {
    if (route.params?.professionalId) {
      navigation.navigate('MessageThread', {
        conversationId: `conv_${route.params.professionalId}`,
        professionalName: route.params.professionalName,
      });
    }
    fetchConversations();
  }, []);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.convCard}
      onPress={() => navigation.navigate('MessageThread', { conversationId: item.id, professionalName: item.professionalName })}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{item.professionalName[0]}</Text></View>
      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={styles.convName}>{item.professionalName}</Text>
          <Text style={styles.convTime}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.convBottom}>
          <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList data={conversations} keyExtractor={i => i.id} renderItem={renderConversation}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </SafeAreaView>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;
  return date.toLocaleDateString('en-NL', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A3A52', padding: 16, paddingBottom: 12 },
  convCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1A3A52', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  convInfo: { flex: 1, marginLeft: 12 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { fontSize: 15, fontWeight: '600', color: '#1A3A52' },
  convTime: { fontSize: 12, color: '#999' },
  convBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  lastMsg: { fontSize: 14, color: '#666', flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: '#1A3A52', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
});
