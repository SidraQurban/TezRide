import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { COLORS } from "../constants/theme";

const { width } = Dimensions.get("window");

export default function AnimatedSplashScreen({ isAppReady, renderApp }) {
  const [animationFinished, setAnimationFinished] = useState(false);
  
  // Logo starts slightly scaled up and invisible
  const logoScale = useSharedValue(1.3);
  const logoOpacity = useSharedValue(0);
  
  // Container hides using a parameter from 1 -> 0
  const containerParams = useSharedValue(1);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(() => {});

      // 1. Logo reveals itself beautifully (zoom down & fade in)
      logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });

      // 2. Smooth transition to the app ("diving in" effect)
      containerParams.value = withDelay(
        2000, // Hold for a full 2 seconds so it isn't too quick
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }, () => {
          runOnJS(setAnimationFinished)(true);
        })
      );
    }
  }, [isAppReady]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Fades out and scales up slightly to create a zoom-into-app effect
    return {
      opacity: containerParams.value,
      transform: [
        {
          scale: interpolate(containerParams.value, [1, 0], [1, 1.1])
        }
      ],
    };
  });

  if (animationFinished) {
    return renderApp();
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {renderApp()}
      
      <Animated.View style={[StyleSheet.absoluteFill, styles.splashContainer, animatedContainerStyle]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.gradient}
        >
          <Animated.Image
            source={require("../../assets/logoo.png")}
            style={[styles.logo, animatedLogoStyle]}
            resizeMode="contain"
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    zIndex: 999,
    elevation: 999,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
  },
});
