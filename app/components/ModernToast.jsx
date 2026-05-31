import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
    Dimensions,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
} from 'react-native-responsive-dimensions';
import { CheckCircle, XCircle, Info } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const ModernToast = ({ visible, message, type = 'success' }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: responsiveHeight(8),
                    useNativeDriver: true,
                    bounciness: 8,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible && opacity._value === 0) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color="#10B981" />;
            case 'error': return <XCircle size={20} color="#EF4444" />;
            default: return <Info size={20} color={COLORS.primary} />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            default: return COLORS.primary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY }], opacity, borderLeftColor: getBorderColor() },
            ]}
        >
            <View style={styles.iconContainer}>
                {getIcon()}
            </View>
            <Text style={styles.message} numberOfLines={2}>
                {message}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        width: width * 0.9,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        zIndex: 9999,
        borderLeftWidth: 4,
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontFamily: FONTS.medium,
        fontSize: responsiveFontSize(1.6),
        color: '#1F2937',
    },
});

export default ModernToast;
