import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean; submitting: boolean; onClose: () => void;
  onSubmit: (input: { reason: string; details: string; evidence?: { uri: string; name: string } }) => void;
}

export default function ReportModal({ visible, submitting, onClose, onSubmit }: Props) {
  const [details, setDetails] = useState('');
  const [evidence, setEvidence] = useState<{ uri: string; name: string }>();
  const chooseEvidence = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: .8 });
    if (!result.canceled) setEvidence({ uri: result.assets[0].uri, name: result.assets[0].fileName ?? 'report-evidence.jpg' });
  };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.backdrop}><View style={styles.card}>
    <Text style={styles.title}>Report hangout</Text><Text style={styles.copy}>Reports and evidence are private and visible only to the safety team.</Text>
    <TextInput style={styles.input} value={details} onChangeText={setDetails} multiline placeholder="Tell us what happened" placeholderTextColor="#6B7280" maxLength={5000} />
    <TouchableOpacity style={styles.secondary} onPress={chooseEvidence}><Text style={styles.secondaryText}>{evidence ? `Attached: ${evidence.name}` : 'Attach photo or video (optional)'}</Text></TouchableOpacity>
    <TouchableOpacity style={[styles.submit, (!details.trim() || submitting) && styles.disabled]} disabled={!details.trim() || submitting} onPress={() => onSubmit({ reason: 'unsafe_behavior', details: details.trim(), evidence })}><Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit report'}</Text></TouchableOpacity>
    <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
  </View></View></Modal>;
}

const styles = StyleSheet.create({ backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.7)', justifyContent: 'flex-end' }, card: { backgroundColor: '#120E22', padding: 22, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, title: { color: '#FFF', fontSize: 20, fontWeight: '800' }, copy: { color: '#9CA3AF', marginTop: 6, marginBottom: 16, lineHeight: 18 }, input: { minHeight: 120, backgroundColor: '#07050E', color: '#FFF', borderRadius: 12, padding: 14, textAlignVertical: 'top' }, secondary: { paddingVertical: 14 }, secondaryText: { color: '#A78BFA', fontWeight: '700' }, submit: { backgroundColor: '#EF4444', padding: 14, borderRadius: 12, alignItems: 'center' }, submitText: { color: '#FFF', fontWeight: '800' }, cancel: { padding: 14, alignItems: 'center' }, cancelText: { color: '#9CA3AF' }, disabled: { opacity: .45 } });
