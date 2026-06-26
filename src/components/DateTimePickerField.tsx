import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';

interface Props {
  value: string;
  onChange: (value: string) => void;
  mode: 'date' | 'datetime';
  placeholder: string;
  minimumDate?: Date;
  maximumDate?: Date;
  defaultDate?: Date;
}

function localDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DateTimePickerField({ value, onChange, mode, placeholder, minimumDate, maximumDate, defaultDate }: Props) {
  const initial = useMemo(() => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : defaultDate ?? new Date(), [defaultDate, value]);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'date' | 'time'>('date');
  const [draft, setDraft] = useState(initial);

  const display = value
    ? mode === 'date' ? initial.toLocaleDateString() : initial.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : placeholder;

  const open = () => { setDraft(initial); setPhase('date'); setVisible(true); };
  const commit = (date: Date) => onChange(mode === 'date' ? localDate(date) : date.toISOString());
  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || !selected) { setVisible(false); return; }
    if (Platform.OS === 'android' && mode === 'datetime' && phase === 'date') {
      const combined = new Date(selected); combined.setHours(draft.getHours(), draft.getMinutes(), 0, 0);
      setDraft(combined); setPhase('time'); return;
    }
    const finalDate = phase === 'time'
      ? new Date(draft.getFullYear(), draft.getMonth(), draft.getDate(), selected.getHours(), selected.getMinutes())
      : selected;
    setDraft(finalDate); commit(finalDate);
    if (Platform.OS === 'android') setVisible(false);
  };

  return <>
    <TouchableOpacity style={styles.field} onPress={open}>
      <Text style={[styles.value, !value && styles.placeholder]}>{display}</Text>
      <CalendarDays size={18} color="#8B5CF6" />
    </TouchableOpacity>
    {visible && <View style={Platform.OS === 'ios' ? styles.iosPicker : undefined}>
      <DateTimePicker
        value={draft}
        mode={Platform.OS === 'ios' && mode === 'datetime' ? 'datetime' : phase}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={handleChange}
        themeVariant="dark"
      />
      {Platform.OS === 'ios' && <TouchableOpacity style={styles.done} onPress={() => { commit(draft); setVisible(false); }}><Text style={styles.doneText}>Done</Text></TouchableOpacity>}
    </View>}
  </>;
}

const styles = StyleSheet.create({
  field: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,.03)', borderWidth: 1, borderColor: 'rgba(139,92,246,.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  value: { color: '#FFFFFF', fontSize: 15, flex: 1 }, placeholder: { color: '#6B7280' },
  iosPicker: { backgroundColor: '#120E22', borderRadius: 12, overflow: 'hidden', paddingBottom: 8 },
  done: { alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 8 }, doneText: { color: '#A78BFA', fontWeight: '800' },
});
