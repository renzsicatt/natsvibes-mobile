import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { Send } from 'lucide-react-native';

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface ChatTabProps {
  messages: Message[];
  typedMessage: string;
  setTypedMessage: (text: string) => void;
  onSendChat: () => void;
}

export default function ChatTab({
  messages,
  typedMessage,
  setTypedMessage,
  onSendChat
}: ChatTabProps) {
  return (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderTitle}>Neon Night Out @ Agimat</Text>
        <Text style={styles.chatHeaderSubtitle}>Sofia V., Alex R., Renz • Meets 9:00 PM</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.isMe ? styles.msgRowMe : styles.msgRowOther]}>
            <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleOther]}>
              {!msg.isMe && <Text style={styles.senderName}>{msg.sender}</Text>}
              <Text style={styles.msgText}>{msg.text}</Text>
              <Text style={styles.msgTime}>{msg.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput 
          style={styles.chatInput} 
          placeholder="Message group..." 
          placeholderTextColor="#6B7280"
          value={typedMessage}
          onChangeText={setTypedMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={onSendChat}>
          <Send size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatHeader: {
    backgroundColor: '#120E22',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.15)',
    padding: 16,
    alignItems: 'flex-start',
  },
  chatHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  chatHeaderSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '75%',
    alignItems: 'flex-start',
  },
  bubbleMe: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  senderName: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  msgText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'left',
  },
  msgTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.15)',
    backgroundColor: '#07050E',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    height: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
