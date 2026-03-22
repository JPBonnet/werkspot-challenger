import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPaymentIntent, processPayment, generateReceipt, formatCurrency } from '../../services/paymentService';

type Step = 'card' | 'processing' | 'success';

export default function PaymentScreen({ route, navigation }: any) {
  const { professional, service, budget, tax, total, jobId } = route.params;
  const [step, setStep] = useState<Step>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [receipt, setReceipt] = useState<any>(null);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const handlePay = async () => {
    if (cardNumber.replace(/\s/g, '').length < 16) return Alert.alert('Invalid Card', 'Please enter a valid card number.');
    if (expiry.length < 5) return Alert.alert('Invalid Expiry', 'Please enter a valid expiry date.');
    if (cvc.length < 3) return Alert.alert('Invalid CVC', 'Please enter a valid CVC.');

    setStep('processing');
    try {
      const intent = await createPaymentIntent(total * 100);
      const result = await processPayment(intent.id, { number: cardNumber, expiry, cvc });
      if (result.success) {
        const rcpt = generateReceipt(jobId, budget, tax, service.name, professional.name);
        setReceipt(rcpt);
        setStep('success');
      } else {
        Alert.alert('Payment Failed', result.error || 'Please try again.');
        setStep('card');
      }
    } catch {
      Alert.alert('Error', 'Payment processing failed.');
      setStep('card');
    }
  };

  if (step === 'processing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A3A52" />
          <Text style={styles.processingText}>Processing payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centered}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>Your booking has been confirmed</Text>

          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>Receipt</Text>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Service</Text><Text style={styles.receiptValue}>{service.name}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Professional</Text><Text style={styles.receiptValue}>{professional.name}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Subtotal</Text><Text style={styles.receiptValue}>{formatCurrency(budget)}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Tax (21% BTW)</Text><Text style={styles.receiptValue}>{formatCurrency(tax)}</Text></View>
            <View style={styles.divider} />
            <View style={styles.receiptRow}><Text style={styles.totalLabel}>Total Paid</Text><Text style={styles.totalValue}>{formatCurrency(total)}</Text></View>
            <Text style={styles.receiptId}>Receipt #{receipt?.id}</Text>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('MyJobs')}>
            <Text style={styles.doneBtnText}>View My Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.linkText}>Back to Search</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A3A52" />
        </TouchableOpacity>

        <Text style={styles.title}>Payment</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{service.name}</Text>
          <Text style={styles.summaryPro}>with {professional.name}</Text>
          <View style={styles.divider} />
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Service</Text><Text style={styles.receiptValue}>{formatCurrency(budget)}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Tax (21% BTW)</Text><Text style={styles.receiptValue}>{formatCurrency(tax)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{formatCurrency(total)}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Card Details</Text>
        <View style={styles.cardForm}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput style={styles.input} placeholder="1234 5678 9012 3456" value={cardNumber}
            onChangeText={t => setCardNumber(formatCardNumber(t))} keyboardType="numeric" maxLength={19} />
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Expiry</Text>
              <TextInput style={styles.input} placeholder="MM/YY" value={expiry}
                onChangeText={t => setExpiry(formatExpiry(t))} keyboardType="numeric" maxLength={5} />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput style={styles.input} placeholder="123" value={cvc}
                onChangeText={t => setCvc(t.replace(/\D/g, '').slice(0, 4))} keyboardType="numeric" maxLength={4} secureTextEntry />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <Ionicons name="lock-closed" size={18} color="#fff" />
          <Text style={styles.payBtnText}>Pay {formatCurrency(total)}</Text>
        </TouchableOpacity>
        <Text style={styles.secureText}>Payments are processed securely via Stripe</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  backBtn: { padding: 16, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A3A52', paddingHorizontal: 16, marginTop: 8, marginBottom: 16 },
  summaryCard: { backgroundColor: '#f5f5f5', marginHorizontal: 16, padding: 16, borderRadius: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  summaryPro: { fontSize: 14, color: '#666', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  receiptLabel: { fontSize: 14, color: '#666' },
  receiptValue: { fontSize: 14, color: '#666' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#1A3A52' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1A3A52' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A3A52', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  cardForm: { paddingHorizontal: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 6 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  payBtn: { flexDirection: 'row', backgroundColor: '#1A3A52', marginHorizontal: 16, marginTop: 24, paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secureText: { textAlign: 'center', fontSize: 12, color: '#999', marginTop: 8, marginBottom: 24 },
  processingText: { fontSize: 16, color: '#1A3A52', marginTop: 16 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A3A52', marginBottom: 4 },
  successSub: { fontSize: 15, color: '#666', marginBottom: 24 },
  receiptCard: { backgroundColor: '#f5f5f5', width: '100%', padding: 20, borderRadius: 12, marginBottom: 24 },
  receiptTitle: { fontSize: 18, fontWeight: '600', color: '#1A3A52', marginBottom: 12 },
  receiptId: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' },
  doneBtn: { backgroundColor: '#1A3A52', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 8, marginBottom: 12 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkText: { fontSize: 14, color: '#1A3A52', textDecorationLine: 'underline' },
});
