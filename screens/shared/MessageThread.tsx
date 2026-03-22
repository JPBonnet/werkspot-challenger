import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '../../services/jobStore';
import { useAuthStore } from '../../services/authStore';
import { Message } from '../../models/Job';

export default function MessageThread({ route, navigation }: any) {
  const { conversationId, professionalName } = route.params;
  const [text, setText] = useState('');
  const { messages, fetchMessages, sendMessage } = useJobStore();
  const { user } = useAuthStore();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages(conversationId);
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(conversationId, text.trim());
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id || item.senderId === 'c1';
    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.bubbleText, isMe && styles.myBubbleText]}>{item.text}</Text>
        <Text style={[styles.timeText, isMe && styles.myTimeText]}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A3A52" />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{professionalName[0]}</Text>
        </View>
        <Text style={styles.headerName}>{professionalName}</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList ref={listRef} data={messages} keyExtractor={i => i.id} renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Type a message..." value={text}
            onChangeText={setText} multiline maxLength={1000} />
          <TouchableOpacity style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]}
            onPress={handleSend} disabled={!text.trim()}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { padding: 4, marginRight: 8 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A3A52', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerAvatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerName: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#1A3A52', borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#f5f5f5', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: '#333', lineHeight: 20 },
  myBubbleText: { color: '#fff' },
  timeText: { fontSize: 11, color: '#999', marginTop: 4 },
  myTimeText: { color: 'rgba(255,255,255,0.6)' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 8 },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A3A52', alignItems: 'center', justifyContent: 'center' },
});
