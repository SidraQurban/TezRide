import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { COLORS } from '../constants';
import { FONTS } from '../constants/theme';
import { useTranslation } from 'react-i18next';

const InterestedDrivers = ({ drivers, onSelect, rideId }) => {
  const { t } = useTranslation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(rideId, item.driverId)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: responsiveWidth(4),
        borderRadius: 15,
        marginBottom: responsiveHeight(1.5),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
    >
      <Image
        source={{ uri: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90)}.jpg` }}
        style={{
          width: responsiveWidth(14),
          height: responsiveWidth(14),
          borderRadius: responsiveWidth(7),
        }}
      />
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.bold, fontSize: responsiveFontSize(1.9) }}>
            {t("driver")} {item.driverId.substring(0, 4)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={{ marginLeft: 4, fontFamily: FONTS.medium }}>
              {item.rating ? parseFloat(item.rating).toFixed(1) : "5.0"}
            </Text>
          </View>
        </View>
        
        <Text style={{ color: '#8A8A8A', fontSize: responsiveFontSize(1.6), marginTop: 2 }}>
          {item.vehicleType} • {item.distanceKm != null ? parseFloat(item.distanceKm).toFixed(2) : "0.00"} km {t("away")}
        </Text>
      </View>

      <TouchableOpacity 
        onPress={() => onSelect(rideId, item.driverId)}
        style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          marginLeft: 10
        }}
      >
        <Text style={{ color: '#fff', fontFamily: FONTS.bold, fontSize: 12 }}>{t("select")}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: responsiveWidth(4) }}>
      <Text style={{ 
        fontFamily: FONTS.bold, 
        fontSize: responsiveFontSize(2), 
        marginBottom: responsiveHeight(2),
        color: COLORS.black 
      }}>
        {t("interested_drivers")} ({drivers.length})
      </Text>
      
      <FlatList
        data={drivers}
        renderItem={renderItem}
        keyExtractor={item => item.driverId}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#8A8A8A' }}>{t("searching_nearby_drivers")}</Text>
          </View>
        }
      />
    </View>
  );
};

export default InterestedDrivers;
