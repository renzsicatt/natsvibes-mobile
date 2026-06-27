import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { MyHangout } from '../types';

interface Props { visible: boolean; hangout: MyHangout | null; currentUserId: number; submitting: boolean; onClose: () => void; onSubmit: (input: { reviewed_user_id: number; rating: number; attendance: 'attended' | 'no_show' | 'cancelled'; safety_concern: boolean; private_notes: string }) => void }

export default function PeerReviewModal({ visible, hangout, currentUserId, submitting, onClose, onSubmit }: Props) {
  const members = hangout?.member_options.filter(member => member.id !== currentUserId) ?? [];
  const [userId, setUserId] = useState(0); const [rating, setRating] = useState(5); const [attendance, setAttendance] = useState<'attended' | 'no_show'>('attended'); const [safety, setSafety] = useState(false); const [notes, setNotes] = useState('');
  useEffect(() => { setUserId(members[0]?.id ?? 0); }, [visible, hangout?.id]);
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.backdrop}><View style={styles.card}><Text style={styles.title}>Review a member</Text>
    <View style={styles.options}>{members.map(member => <TouchableOpacity key={member.id} style={[styles.option, userId === member.id && styles.active]} onPress={() => setUserId(member.id)}><Text style={styles.text}>{member.name}</Text></TouchableOpacity>)}</View>
    <Text style={styles.label}>Rating</Text><View style={styles.options}>{[1,2,3,4,5].map(value => <TouchableOpacity key={value} onPress={() => setRating(value)}><Text style={styles.star}>{value <= rating ? '★' : '☆'}</Text></TouchableOpacity>)}</View>
    <View style={styles.options}>{(['attended','no_show'] as const).map(value => <TouchableOpacity key={value} style={[styles.option, attendance === value && styles.active]} onPress={() => setAttendance(value)}><Text style={styles.text}>{value.replace('_',' ')}</Text></TouchableOpacity>)}</View>
    <View style={styles.row}><Text style={styles.text}>Safety concern</Text><Switch value={safety} onValueChange={setSafety} /></View><TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Private notes (optional)" placeholderTextColor="#6B7280" multiline />
    <TouchableOpacity style={[styles.submit, (!userId || submitting) && styles.disabled]} disabled={!userId || submitting} onPress={() => onSubmit({ reviewed_user_id: userId, rating, attendance, safety_concern: safety, private_notes: notes })}><Text style={styles.submitText}>{submitting ? 'Saving…' : 'Save review'}</Text></TouchableOpacity><TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.text}>Cancel</Text></TouchableOpacity>
  </View></View></Modal>;
}
const styles = StyleSheet.create({ backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.7)',justifyContent:'flex-end'},card:{backgroundColor:'#120E22',padding:22,borderTopLeftRadius:24,borderTopRightRadius:24},title:{color:'#FFF',fontSize:20,fontWeight:'800',marginBottom:14},label:{color:'#9CA3AF',marginTop:10},options:{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:8},option:{paddingHorizontal:10,paddingVertical:8,borderRadius:9,backgroundColor:'#07050E'},active:{backgroundColor:'#7C3AED'},text:{color:'#D1D5DB'},star:{color:'#FBBF24',fontSize:28},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:8},input:{minHeight:70,backgroundColor:'#07050E',color:'#FFF',padding:12,borderRadius:10,textAlignVertical:'top'},submit:{backgroundColor:'#8B5CF6',padding:14,borderRadius:12,alignItems:'center',marginTop:12},submitText:{color:'#FFF',fontWeight:'800'},cancel:{padding:12,alignItems:'center'},disabled:{opacity:.45} });
