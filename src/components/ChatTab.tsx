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
import type { Message, MyHangout } from '../types';

interface ChatTabProps {
  messages: Message[];
  typedMessage: string;
  setTypedMessage: (text: string) => void;
  onSendChat: () => void;
  activeChatHangout: MyHangout | null;
  myHangoutsList: MyHangout[];
  onSelectHangout: (hangout: MyHangout) => void;
  onNavigateToDiscover: () => void;
  replyingTo: Message | null;
  editingMessageId: number | null;
  onReply: (message: Message | null) => void;
  onEdit: (message: Message) => void;
  onDelete: (id: number) => void;
  onReact: (id: number, emoji: string) => void;
  onReview: () => void;
}

export default function ChatTab({
  messages,
  typedMessage,
  setTypedMessage,
  onSendChat,
  activeChatHangout,
  myHangoutsList,
  onSelectHangout,
  onNavigateToDiscover, replyingTo, editingMessageId, onReply, onEdit, onDelete, onReact, onReview
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
        {activeChatHangout.status === 'completed' && <TouchableOpacity onPress={onReview}><Text style={styles.reviewLink}>Review members</Text></TouchableOpacity>}
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
              <TouchableOpacity onLongPress={() => msg.isMe ? onEdit(msg) : onReply(msg)} style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleOther]}>
                {!msg.isMe && <Text style={styles.senderName}>{msg.sender}</Text>}
                {msg.replyText && <Text style={styles.replyPreview}>↪ {msg.replyText}</Text>}
                <Text style={styles.msgText}>{msg.text}</Text>
                <Text style={styles.msgTime}>{msg.time}{msg.edited ? ' · edited' : ''}</Text>
                <View style={styles.reactions}>{msg.reactions.map(reaction => <TouchableOpacity key={reaction.emoji} style={[styles.reaction, reaction.reacted && styles.reacted]} onPress={() => onReact(msg.id, reaction.emoji)}><Text>{reaction.emoji} {reaction.count}</Text></TouchableOpacity>)}<TouchableOpacity style={styles.reaction} onPress={() => onReact(msg.id, '❤️')}><Text>＋</Text></TouchableOpacity></View>
                <View style={styles.messageActions}><TouchableOpacity onPress={() => onReply(msg)}><Text style={styles.actionText}>Reply</Text></TouchableOpacity>{msg.isMe && <><TouchableOpacity onPress={() => onEdit(msg)}><Text style={styles.actionText}>Edit</Text></TouchableOpacity><TouchableOpacity onPress={() => onDelete(msg.id)}><Text style={[styles.actionText, styles.deleteText]}>Delete</Text></TouchableOpacity></>}</View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* 4. Text Input */}
      <View style={styles.chatInputRow}>
        {(replyingTo || editingMessageId) && <View style={styles.composerContext}><Text style={styles.composerContextText}>{editingMessageId ? 'Editing message' : `Replying to ${replyingTo?.sender}`}</Text><TouchableOpacity onPress={() => { onReply(null); setTypedMessage(''); }}><Text style={styles.contextClose}>✕</Text></TouchableOpacity></View>}
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
  reviewLink: { color: '#A78BFA', fontWeight: '700', fontSize: 12, marginTop: 8 },
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
  replyPreview: { color: '#C4B5FD', fontSize: 11, borderLeftWidth: 2, borderLeftColor: '#8B5CF6', paddingLeft: 6, marginBottom: 5 },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }, reaction: { backgroundColor: 'rgba(255,255,255,.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9 }, reacted: { borderWidth: 1, borderColor: '#C4B5FD' },
  messageActions: { flexDirection: 'row', gap: 12, marginTop: 7 }, actionText: { color: '#DDD6FE', fontSize: 10, fontWeight: '700' }, deleteText: { color: '#FCA5A5' },
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
    flexWrap: 'wrap',
  },
  composerContext: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#120E22', padding: 8, borderRadius: 8 }, composerContextText: { color: '#C4B5FD', fontSize: 11 }, contextClose: { color: '#9CA3AF' },
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
