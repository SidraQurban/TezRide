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
        alignSelf: 'flex-end',
        width: responsiveWidth(75),
        marginTop: responsiveHeight(2),
        marginRight: responsiveWidth(4),
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: responsiveWidth(3),
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0'
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
          <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, fontSize: responsiveFontSize(1.6) }}>
            {driver.driverName || t("driver")}
          </Text>
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
