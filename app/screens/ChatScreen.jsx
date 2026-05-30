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
  StatusBar
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sendScale = useSharedValue(1);

  /* ── init ── */
  useEffect(() => {
    const init = async () => {
      const uId = await storage.getItem('userId');
      setUserId(uId);
      await chatHub.start();
      await chatHub.joinRideChat(rideId);

      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/conversation/history/${rideId}`, {
          headers: { Authorization: `Bearer ${await storage.getItem('jwToken')}` }
        });
        if (res.ok) {
          const text = await res.text();
          if (text) {
            const json = JSON.parse(text);
            if (json.succeeded) setMessages(json.data.reverse());
          }
        }
      } catch (e) {
        console.error('[ChatScreen] history error', e);
      } finally {
        setLoading(false);
      }
    };
    init();

    const onMsg = (p) => {
      if (p.rideId === rideId) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMessages(prev => [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          senderId: p.senderId,
          content: p.content,
          timestamp: p.timestamp
        }]);
        setIsTyping(false);
      }
    };

    const onTyping = (p) => {
      if (p.rideId === rideId) {
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

  /* ── actions ── */
  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendScale.value = withSpring(0.85, {}, () => {
      sendScale.value = withSpring(1);
    });
    await chatHub.sendMessage(rideId, text);
  }, [inputText, rideId]);

  const onTextChange = useCallback((text) => {
    setInputText(text);
    chatHub.typing(rideId);
  }, [rideId]);

  const handleCall = () => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
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
    return messages[index].senderId === messages[index - 1].senderId
      && !shouldShowTimestamp(index);
  };

  /* ── render message ── */
  const renderItem = useCallback(({ item, index }) => {
    const isMe = String(item.senderId).toLowerCase() === String(userId).toLowerCase();
    const consecutive = isConsecutive(index);
    const showTime = shouldShowTimestamp(index);
    const entering = isMe
      ? SlideInRight.delay(30).springify().damping(18)
      : SlideInLeft.delay(30).springify().damping(18);

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
            consecutive && { marginTop: -2 }
          ]}
        >
          <View style={[
            styles.bubble,
            isMe ? styles.bubbleMine : styles.bubbleOther,
            consecutive && isMe && { borderTopRightRadius: 18 },
            consecutive && !isMe && { borderTopLeftRadius: 18 }
          ]}>
            <Text style={[styles.msgText, isMe && styles.msgTextMine]}>
              {item.content}
            </Text>
            <View style={styles.bubbleFooter}>
              <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMine]}>
                {formatTime(item.timestamp)}
              </Text>
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Background gradient ── */}
      <LinearGradient
        colors={['#FFF5EB', '#F0F2F5', '#F0F2F5']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#1A1A2E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerCenter} activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              {profilePicUrl ? (
                <Image source={{ uri: profilePicUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.avatarFallback}>
                  <Ionicons name="person" size={18} color="#FFF" />
                </LinearGradient>
              )}
              <View style={[styles.statusDot, isTyping && styles.statusDotTyping]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerName} numberOfLines={1}>{driverName || t('driver')}</Text>
              {isTyping ? (
                <Animated.Text entering={FadeIn.duration(200)} style={styles.headerStatus}>
                  {t('typing') || 'typing'}...
                </Animated.Text>
              ) : (
                <Text style={styles.headerStatusOnline}>{t('online') || 'Online'}</Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCall} style={[styles.headerBtn, styles.callBtn]} activeOpacity={0.7}>
            <Ionicons name="call" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Message list ── */}
      {loading ? (
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
          contentContainerStyle={[
            styles.listContent,
            messages.length === 0 && { flex: 1 }
          ]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState driverName={driverName} t={t} />}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />
      )}

      {/* ── Input bar ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputBarOuter}>
          <View style={[styles.inputBar, { flexDirection: i18n.language?.startsWith("ur") ? "row-reverse" : "row" }]}>
            <TouchableOpacity style={styles.attachBtn} activeOpacity={0.6}>
              <Ionicons name="add-circle-outline" size={26} color="#999" />
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { textAlign: "left", writingDirection: "ltr" }]}
              placeholder={t('type_message') || 'Type a message...'}
              placeholderTextColor="#B0B0B0"
              value={inputText}
              onChangeText={onTextChange}
              multiline
              maxLength={1000}
            />

            <AnimatedTouchable
              style={[styles.sendBtn, hasText && styles.sendBtnActive, sendBtnStyle]}
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
                  name="send"
                  size={17}
                  color="#FFF"
                  style={{ marginLeft: 2 }}
                />
              </LinearGradient>
            </AnimatedTouchable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

/* ════════════════════════════ STYLES ════════════════════════════ */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* header */
  safeHeader: { backgroundColor: 'transparent', zIndex: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F2F3F5',
    justifyContent: 'center', alignItems: 'center'
  },
  callBtn: { backgroundColor: 'rgba(255,92,0,0.08)' },
  headerCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 10
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  avatarFallback: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center'
  },
  statusDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2, borderColor: '#FFF'
  },
  statusDotTyping: { backgroundColor: COLORS.primary },
  headerText: { marginLeft: 10, flex: 1 },
  headerName: { fontFamily: FONTS.semiBold, fontSize: 15, color: '#1A1A2E' },
  headerStatus: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.primary, marginTop: 1 },
  headerStatusOnline: { fontFamily: FONTS.medium, fontSize: 11, color: '#34C759', marginTop: 1 },

  /* loading */
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingLabel: { fontFamily: FONTS.medium, fontSize: 13, color: '#999', marginTop: 12 },

  /* list */
  listContent: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8 },

  /* empty state */
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  emptyIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,92,0,0.08)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 18, color: '#1A1A2E', marginBottom: 6 },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: 13, color: '#999', textAlign: 'center' },

  /* time chip */
  timeChipRow: { alignItems: 'center', marginVertical: 14 },
  timeChip: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12
  },
  timeChipText: { fontFamily: FONTS.medium, fontSize: 11, color: '#888' },

  /* message row */
  msgRow: { flexDirection: 'row', marginBottom: 6, paddingHorizontal: 4 },
  msgRowRight: { justifyContent: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EEE', overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 6, marginTop: 2
  },
  msgAvatarImg: { width: 28, height: 28, borderRadius: 14 },

  /* bubble */
  bubble: {
    maxWidth: SCREEN_W * 0.75,
    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4,
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4
  },
  msgText: { fontFamily: FONTS.regular, fontSize: 16, lineHeight: 22, color: '#1A1A2E' },
  msgTextMine: { color: '#FFF' },
  bubbleFooter: {
    alignSelf: 'flex-end',
    marginTop: 2,
    minWidth: 40,
    alignItems: 'flex-end'
  },
  bubbleTime: {
    fontFamily: FONTS.regular, fontSize: 10, color: 'rgba(0,0,0,0.3)',
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },

  /* typing indicator */
  typingRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, marginTop: 4 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1
  },
  typingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary, marginHorizontal: 2
  },

  /* input bar */
  inputBarOuter: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)'
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#F4F5F7',
    borderRadius: 26, paddingHorizontal: 6, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)'
  },
  attachBtn: { padding: 8 },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 15, color: '#1A1A2E',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 110, minHeight: 38
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    overflow: 'hidden', marginBottom: 1
  },
  sendBtnActive: {},
  sendGradient: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center'
  }
});

export default ChatScreen;
