import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { COLORS, FONTS } from '../constants/theme';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

const DriverInterestCard = ({ driver, onAccept, onDecline, duration = 15000 }) => {
  const { t } = useTranslation();
  const [progress] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(responsiveWidth(100))); // Start off-screen to the right

  useEffect(() => {
    // Slide in from right
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7
    }).start();

    // Progress bar animation
    Animated.timing(progress, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onDecline(driver.driverId);
      }
    });
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }],
        alignSelf: 'stretch',
        width: '100%',
        marginTop: responsiveHeight(1.5),
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: responsiveWidth(4),
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EFEFEF'
      }}
    >
      {/* Progress Bar Background */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: 3, 
        backgroundColor: '#F0F0F0' 
      }}>
        <Animated.View style={{ 
          height: 3, 
          backgroundColor: COLORS.primary,
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          })
        }} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {driver.profilePicUrl ? (
          <Image
            source={{ uri: driver.profilePicUrl }}
            style={{
              width: responsiveWidth(12),
              height: responsiveWidth(12),
              borderRadius: responsiveWidth(6),
            }}
          />
        ) : (
          <View
            style={{
              width: responsiveWidth(12),
              height: responsiveWidth(12),
              borderRadius: responsiveWidth(6),
              backgroundColor: '#F0F0F0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="person" size={24} color="#AAA" />
          </View>
        )}
        
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, fontSize: responsiveFontSize(1.6), flex: 1 }}>
              {driver.driverName || t("driver")}
            </Text>
            {driver.rating !== undefined && driver.rating !== null && driver.rating > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
                <Ionicons name="star" size={13} color="#FFC107" />
                <Text style={{ fontSize: 11, marginLeft: 2, color: '#333', fontFamily: FONTS.bold }}>
                  {driver.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'space-between' }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
               {driver.price && (
                 <Text style={{ fontFamily: FONTS.bold, fontSize: responsiveFontSize(1.6), color: COLORS.primary }}>
                   {t("currency")} {driver.price}
                 </Text>
               )}
               {driver.distanceKm !== undefined && driver.distanceKm !== null && (
                 <Text style={{ color: '#8A8A8A', fontSize: 11, marginLeft: 8 }} numberOfLines={1}>
                   • {driver.distanceKm.toFixed(1)} {t("km")}
                 </Text>
               )}
               {driver.gender && (
                 <Text style={{ color: '#8A8A8A', fontSize: 11, marginLeft: 8 }} numberOfLines={1}>
                   • {driver.gender.charAt(0).toUpperCase() + driver.gender.slice(1)}
                 </Text>
               )}
             </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            onPress={() => onDecline(driver.driverId)}
            style={{
              padding: 8,
              backgroundColor: '#FFF1F0',
              borderRadius: 10,
            }}
          >
            <Ionicons name="close" size={18} color="red" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onAccept(driver.driverId)}
            style={{
              padding: 8,
              backgroundColor: '#F6FFED',
              borderRadius: 10,
            }}
          >
            <Ionicons name="checkmark" size={18} color="#52C41A" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default DriverInterestCard;
