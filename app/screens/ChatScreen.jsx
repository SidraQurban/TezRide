import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  ActivityIndicator,
    Dimensions,
  Linking,
  StatusBar,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BackBtn from '../components/BackBtn';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants';
import { FONTS } from '../constants/theme';
import chatHub from '../api/chatHub';
import storage from '../utils/storage';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideInLeft,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/* ────────────── Typing dots component ────────────── */
const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      dot1.value = withTiming(1, { duration: 400 });
      setTimeout(() => { dot2.value = withTiming(1, { duration: 400 }); }, 200);
      setTimeout(() => { dot3.value = withTiming(1, { duration: 400 }); }, 400);
      setTimeout(() => {
        dot1.value = withTiming(0, { duration: 400 });
        dot2.value = withTiming(0, { duration: 400 });
        dot3.value = withTiming(0, { duration: 400 });
      }, 800);
    };
    animate();
    const interval = setInterval(animate, 1600);
    return () => clearInterval(interval);
  }, []);

  const style1 = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -4]) }]
  }));
  const style2 = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -4]) }]
  }));
  const style3 = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -4]) }]
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, style1]} />
        <Animated.View style={[styles.typingDot, style2]} />
        <Animated.View style={[styles.typingDot, style3]} />
      </View>
    </Animated.View>
  );
};

/* ────────────── Empty state ────────────── */
const EmptyState = ({ driverName, t }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name="chatbubbles-outline" size={48} color={COLORS.primary} />
    </View>
    <Text style={styles.emptyTitle}>{t('start_conversation') || 'Start a conversation'}</Text>
    <Text style={styles.emptySubtitle}>
      {t('send_first_message') || `Say hi to ${driverName || 'your driver'}!`}
    </Text>
  </View>
);

/* ────────────── Main screen ────────────── */
const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { rideId, driverName, profilePicUrl, phoneNumber } = route.params;
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = false;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);
  const sendScale = useSharedValue(1);

  /* ── init ── */
  useEffect(() => {
    const loadId = async () => {
      const uId = await storage.getItem('userId');
      setUserId(uId);
    };
    loadId();

    chatHub.start().then(() => chatHub.joinRideChat(rideId));

    const onMsg = (p) => {
      const pRideId = p.rideId || p.RideId;
      if (String(pRideId) === String(rideId)) {
        const senderId = p.senderId || p.SenderId || p.userId || p.UserId;
        const content = p.content || p.Content || p.text || p.Text;
        
        setMessages(prev => {
          // Check if message already exists (optimistic reconciliation)
          const exists = prev.some(m => 
            (m.content === content && m.senderId === senderId && (Math.abs(new Date(m.timestamp) - new Date(p.timestamp || new Date())) < 10000))
          );
          if (exists) return prev;

          return [...prev, {
            id: p.id || p.Id || `${Date.now()}-${Math.random()}`,
            senderId: senderId,
            content: content,
            timestamp: p.timestamp || p.Timestamp || new Date().toISOString()
          }];
        });
        setIsTyping(false);
      }
    };

    const onTyping = (p) => {
      const pRideId = p.rideId || p.RideId;
      if (String(pRideId) === String(rideId)) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    chatHub.on('ReceiveMessage', onMsg);
    chatHub.on('UserTyping', onTyping);
    return () => {
      chatHub.off('ReceiveMessage', onMsg);
      chatHub.off('UserTyping', onTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [rideId]);

  // Refresh history on focus
  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        try {
          const uId = await storage.getItem('userId');
          if (uId) setUserId(uId);

          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://api.tezride.pk'}/api/conversation/history/${rideId}`, {
            headers: { Authorization: `Bearer ${await storage.getItem('jwToken')}` }
          });
          if (res.ok) {
            const json = await res.json();
            if (json.succeeded && json.data) {
              // Map the data into local message format
              // The API returns newest first, so we reverse it for chronological display
              const historyMessages = json.data.reverse().map(m => ({
                id: m.id || m.Id || `${Date.now()}-${Math.random()}`,
                senderId: m.senderId || m.SenderId || m.userId || m.UserId,
                content: (m.content || m.Content || m.text || m.Text || "").trim(),
                timestamp: m.timestamp || m.Timestamp || new Date().toISOString(),
                isRead: m.isRead ?? m.IsRead
              }));
              setMessages(historyMessages);
            }
          }
        } catch (e) {
          console.warn('[ChatScreen] History fetch failed:', e);
        } finally {
          setLoading(false);
        }
      };
      
      fetchHistory();
    }, [rideId])
  );

  /* ── actions ── */
  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    const tempId = `${Date.now()}-me`;
    
    // Optimistic Update
    const newMessage = {
      id: tempId,
      senderId: userId,
      content: text,
      timestamp: new Date().toISOString(),
      sending: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    sendScale.value = withSpring(0.85, {}, () => {
      sendScale.value = withSpring(1);
    });

    try {
      await chatHub.sendMessage(rideId, text);
      // Mark as sent
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, sending: false } : m));
    } catch (e) {
      console.error('[ChatScreen] send error', e);
      // Mark as failed or remove?
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, sending: false, error: true } : m));
    }
  }, [inputText, rideId, userId]);

  const onTextChange = useCallback((text) => {
    setInputText(text);
    
    // Throttle typing events: only send once every 2.5 seconds
    const now = Date.now();
    if (now - lastTypingTimeRef.current > 2500) {
      lastTypingTimeRef.current = now;
      chatHub.typing(rideId);
    }
  }, [rideId]);

  const handleCall = () => {
    if (phoneNumber) {
      let dialNum = phoneNumber.toString();
      if (dialNum.startsWith('92')) {
        dialNum = '0' + dialNum.substring(2);
      }
      Linking.openURL(`tel:${dialNum}`).catch(err => console.warn("Dial error:", err));
    } else {
      console.warn("No phone number found for dialing");
    }
  };

  /* ── helpers ── */
  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const shouldShowTimestamp = (index) => {
    if (index === 0) return true;
    const curr = new Date(messages[index].timestamp).getTime();
    const prev = new Date(messages[index - 1].timestamp).getTime();
    return curr - prev > 300000; // 5 min gap
  };

  const isConsecutive = (index) => {
    if (index === 0) return false;
    return String(messages[index].senderId).toLowerCase() === String(messages[index - 1].senderId).toLowerCase()
      && !shouldShowTimestamp(index);
  };

  /* ── render message ── */
  const renderItem = useCallback(({ item, index }) => {
    const isMe = String(item.senderId).toLowerCase() === String(userId).toLowerCase();
    const consecutive = isConsecutive(index);
    const showTime = shouldShowTimestamp(index);
    
    // Use subtle fade and scale instead of slide for a more premium feel
    const entering = FadeIn.duration(300);

    return (
      <View key={item.id}>
        {showTime && (
          <View style={styles.timeChipRow}>
            <View style={styles.timeChip}>
              <Text style={styles.timeChipText}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
        )}
        <Animated.View
          entering={entering}
          style={[
            styles.msgRow,
            isMe ? styles.msgRowRight : styles.msgRowLeft,
            consecutive && { marginTop: -2 },
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}
        >
          <View style={[
            styles.bubble,
            isMe ? styles.bubbleMine : styles.bubbleOther,
            consecutive && isMe && { borderTopRightRadius: 18 },
            consecutive && !isMe && { borderTopLeftRadius: 18 }
          ]}>
            <Text style={[
              styles.msgText, 
              isMe && styles.msgTextMine,
              { textAlign: i18n.language === 'ur' ? 'right' : 'left' }
            ]}>
              {item.content}
            </Text>
            <View style={[styles.bubbleFooter, { flexDirection: 'row' }]}>
              <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMine]}>
                {formatTime(item.timestamp)}
              </Text>
              {isMe && (
                <Ionicons 
                  name={item.error ? "alert-circle" : (item.sending ? "time-outline" : "checkmark-done")} 
                  size={12} 
                  color={item.error ? "#FF3B30" : "rgba(255,255,255,0.7)"} 
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }, [userId, messages, profilePicUrl]);

  /* ── animated send button ── */
  const sendBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }]
  }));

  const hasText = inputText.trim().length > 0;

  /* ──────────── render ──────────── */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" />

      {/* ── Header (matches other screens: BackBtn + driver info + call) ── */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        {/* Shared back button row (logo + arrow-back-outline) */}
        <BackBtn />
        {/* Driver info sub-header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.avatarContainer}>
              {profilePicUrl ? (
                <Image source={{ uri: profilePicUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.avatarFallback}>
                  <Ionicons name="person" size={20} color="#FFF" />
                </LinearGradient>
              )}
              <View style={[styles.statusIndicator, isTyping && styles.statusIndicatorTyping]} />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.driverNameText} numberOfLines={1}>
                {driverName || (t('driver') === 'driver' ? 'Driver' : t('driver'))}
              </Text>
              <Text style={[styles.statusText, isTyping && { color: COLORS.primary }]}>
                {isTyping ? `${t('typing') === 'typing' ? 'Typing' : t('typing')}...` : (t('online') === 'online' ? 'Online' : t('online'))}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleCall} 
            style={[styles.headerBtn, styles.callHeaderBtn]} 
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Message list ── */}
      {loading || !userId ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingLabel}>{t('loading') || 'Loading'}...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState driverName={driverName} t={t} />}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />
      )}

      {/* ── Input bar ── */}
      <View style={[styles.inputBarOuter, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.6}>
            <Ionicons name="add-circle-outline" size={26} color="#999" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={t('type_message', 'Type a message...')}
            placeholderTextColor="#B0B0B0"
            value={inputText}
            onChangeText={onTextChange}
            textAlign={i18n.language === 'ur' ? 'right' : 'left'}
            multiline
            maxLength={1000}
          />

          <AnimatedTouchable
            style={[styles.sendBtn, sendBtnStyle]}
            onPress={sendMessage}
            disabled={!hasText}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={hasText ? [COLORS.primary, '#FF7B33'] : ['#D5D5D5', '#BDBDBD']}
              style={styles.sendGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={isRTL ? "send-outline" : "send"}
                size={17}
                color="#FFF"
                style={isRTL ? { transform: [{ rotate: "180deg" }] } : null}
              />
            </LinearGradient>
          </AnimatedTouchable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

/* ════════════════════════════ STYLES ════════════════════════════ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  safeHeaderWrapper: { backgroundColor: '#FFF' },
  safeHeader: { backgroundColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callHeaderBtn: { backgroundColor: COLORS.primary + '15' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEE' },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statusIndicator: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#34C759', borderWidth: 2.5, borderColor: '#FFF' },
  statusIndicatorTyping: { backgroundColor: COLORS.primary },
  nameContainer: { marginLeft: 12, flex: 1 },
  driverNameText: { fontSize: 16, fontFamily: FONTS.bold, color: '#1A1A2E' },
  statusText: { fontSize: 12, fontFamily: FONTS.medium, color: '#34C759', marginTop: 1 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingLabel: { fontFamily: FONTS.medium, fontSize: 13, color: '#999', marginTop: 12 },
  listContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  emptyIconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#1A1A2E', marginBottom: 6 },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 40 },
  timeChipRow: { alignItems: 'center', marginVertical: 20 },
  timeChip: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  timeChipText: { fontFamily: FONTS.bold, fontSize: 11, color: '#888' },
  msgRow: { flexDirection: 'row', marginBottom: 12 },
  msgRowRight: { justifyContent: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  bubble: { maxWidth: SCREEN_W * 0.78, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  bubbleMine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#FFF', borderBottomLeftRadius: 4 },
  msgText: { fontFamily: FONTS.medium, fontSize: 15, lineHeight: 21, color: '#1A1A2E' },
  msgTextMine: { color: '#FFF' },
  bubbleFooter: { flexDirection: 'row', alignSelf: 'flex-end', marginTop: 4, alignItems: 'center' },
  bubbleTime: { fontFamily: FONTS.regular, fontSize: 10, color: 'rgba(0,0,0,0.4)' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },
  typingRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, elevation: 1, shadowOpacity: 0.05 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginHorizontal: 2 },
  inputBarOuter: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 28, paddingHorizontal: 4, paddingVertical: 4 },
  attachBtn: { padding: 10 },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: 15, color: '#1A1A2E', paddingHorizontal: 12, maxHeight: 120, minHeight: 40 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;
