import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { Send, MessageSquare } from 'lucide-react-native';
import { MyHangout } from '../types';

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
  activeChatHangout: MyHangout | null;
  myHangoutsList: MyHangout[];
  onSelectHangout: (hangout: MyHangout) => void;
  onNavigateToDiscover: () => void;
}

export default function ChatTab({
  messages,
  typedMessage,
  setTypedMessage,
  onSendChat,
  activeChatHangout,
  myHangoutsList,
  onSelectHangout,
  onNavigateToDiscover
}: ChatTabProps) {
  
  if (!activeChatHangout) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <MessageSquare size={36} color="#8B5CF6" />
          </View>
          <Text style={styles.emptyTitle}>No Active Chats</Text>
          <Text style={styles.emptyText}>
            You must host a hangout or be approved to join one before you can start chatting with other members.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={onNavigateToDiscover}>
            <Text style={styles.emptyBtnText}>Discover Hangouts</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chatContainer}>
      {/* 1. Multiple Groups Selector (Tabs) */}
      {myHangoutsList.length > 1 && (
        <View style={styles.selectorWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.groupsSelectorContent}
          >
            {myHangoutsList.map(h => {
              const isSelected = h.id === activeChatHangout.id;
              return (
                <TouchableOpacity 
                  key={h.id} 
                  style={[styles.groupPill, isSelected && styles.groupPillActive]}
                  onPress={() => onSelectHangout(h)}
                >
                  <Text style={[styles.groupPillText, isSelected && styles.groupPillTextActive]}>
                    {h.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 2. Chat Header */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderTitle} numberOfLines={1}>
          {activeChatHangout.title} @ {activeChatHangout.venue_name}
        </Text>
        <Text style={styles.chatHeaderSubtitle} numberOfLines={1}>
          {activeChatHangout.members_names.join(', ')} • {activeChatHangout.time_summary}
        </Text>
      </View>
      
      {/* 3. Messages List */}
      <ScrollView contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={styles.noMessagesContainer}>
            <Text style={styles.noMessagesText}>No messages yet. Say hi to start the conversation!</Text>
          </View>
        ) : (
          messages.map(msg => (
            <View key={msg.id} style={[styles.msgRow, msg.isMe ? styles.msgRowMe : styles.msgRowOther]}>
              <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleOther]}>
                {!msg.isMe && <Text style={styles.senderName}>{msg.sender}</Text>}
                <Text style={styles.msgText}>{msg.text}</Text>
                <Text style={styles.msgTime}>{msg.time}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 4. Text Input */}
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
  selectorWrapper: {
    backgroundColor: '#07050E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 10,
  },
  groupsSelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  groupPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  groupPillActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  groupPillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  groupPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '700',
  },
  chatHeaderSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMessagesText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
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
    color: '#A78BFA',
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
    color: 'rgba(255, 255, 255, 0.4)',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#07050E',
    padding: 24,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
