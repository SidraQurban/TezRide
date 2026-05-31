import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { COLORS, FONTS } from '../constants';

const { width } = Dimensions.get('window');

const TripCompletionModal = ({ 
  visible, 
  onFinish, 
  activeRide, 
  isSubmitting 
}) => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith('ur');
  const [rating, setRating] = useState(5);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={30} style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Celebratory Icon */}
          <View style={styles.successIconWrapper}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.successIconCircle}
            >
              <Ionicons name="checkmark" size={50} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { fontFamily: FONTS.bold }]}>
            {t('trip_completed_title', { defaultValue: 'Trip Completed!' })}
          </Text>
          <Text style={styles.subtitle}>
            {t('thank_you_ride', { defaultValue: 'Thank you for riding with TezRide.' })}
          </Text>

          {/* Fare Summary Card */}
          <View style={styles.receiptCard}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{activeRide?.distanceKm || '0'} km</Text>
                <Text style={styles.statLabel}>{t('distance')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{activeRide?.durationMinutes || '0'} min</Text>
                <Text style={styles.statLabel}>{t('time')}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fareContainer}>
              <Text style={styles.fareLabel}>
                {activeRide?.payFromWallet 
                  ? t('paid_via_wallet', { defaultValue: 'PAID VIA WALLET' }) 
                  : t('total_fare_paid', { defaultValue: 'TOTAL FARE PAID (CASH)' })}
              </Text>
              <Text style={styles.fareAmount}>
                {activeRide?.currency || 'PKR'} {activeRide?.finalFare || '0'}
              </Text>
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>
              {t('rate_captain', { defaultValue: 'How was your Captain?' })}
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity 
                  key={s} 
                  onPress={() => {
                    setRating(s);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Animated.View style={{ transform: [{ scale: s === rating ? 1.2 : 1 }] }}>
                    <Ionicons 
                      name={s <= rating ? "star" : "star-outline"} 
                      size={42} 
                      color={s <= rating ? "#F59E0B" : "#E2E8F0"} 
                      style={{ marginHorizontal: 6 }}
                    />
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isSubmitting}
            onPress={() => onFinish(rating)}
            style={styles.finishBtnWrapper}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.finishBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.finishBtnText}>
                  {t('submit_and_finish', { defaultValue: 'Submit & Finish' })}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 35,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  successIconWrapper: {
    marginTop: -60,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
  },
  title: {
    fontSize: responsiveFontSize(2.8),
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.8),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
    color: '#1F2937',
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    color: '#9CA3AF',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  fareContainer: {
    alignItems: 'center',
  },
  fareLabel: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.4),
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  fareAmount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: responsiveFontSize(4),
    color: COLORS.primary,
  },
  ratingSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingTitle: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2),
    color: '#374151',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  finishBtnWrapper: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  finishBtn: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishBtnText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
    color: '#FFF',
  },
});

export default TripCompletionModal;
