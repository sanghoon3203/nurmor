import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, glass, motion, radii } from '../../theme/tokens';

type SurfaceTone = 'clear' | 'strong' | 'green' | 'sky' | 'bloom';

type GlassProps = {
  children: ReactNode;
  tone?: SurfaceTone;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function GradientScreen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.gradientScreen, style]}>
      <View style={styles.topWash} />
      <View style={styles.bloomWash} />
      <View style={styles.skyWash} />
      {children}
    </View>
  );
}

export function GlassPanel({ children, tone = 'clear', style, contentStyle }: GlassProps) {
  return (
    <View style={[styles.panelShell, style]}>
      <View style={[styles.panelFallback, toneStyle(tone)]} />
      <View style={[styles.panelContent, contentStyle]}>{children}</View>
    </View>
  );
}

export function GlassCard({ children, tone = 'clear', style, contentStyle }: GlassProps) {
  return (
    <GlassPanel tone={tone} style={[styles.cardShell, style]} contentStyle={[styles.cardContent, contentStyle]}>
      {children}
    </GlassPanel>
  );
}

export function FloatingGlassBar({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <GlassPanel tone="strong" style={[styles.floatingBar, style]} contentStyle={styles.floatingBarContent}>
      {children}
    </GlassPanel>
  );
}

export function RevealView({
  children,
  delay = 0,
  distance = 24,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    value.setValue(0);
    Animated.timing(value, {
      toValue: 1,
      delay,
      duration: motion.panelMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, value]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function toneStyle(tone: SurfaceTone) {
  switch (tone) {
    case 'strong':
      return styles.surfaceStrong;
    case 'green':
      return styles.surfaceGreen;
    case 'sky':
      return styles.surfaceSky;
    case 'bloom':
      return styles.surfaceBloom;
    default:
      return styles.surfaceClear;
  }
}

const styles = StyleSheet.create({
  gradientScreen: {
    flex: 1,
    backgroundColor: colors.field,
  },
  topWash: {
    position: 'absolute',
    left: -30,
    right: -30,
    top: -80,
    height: 310,
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    backgroundColor: 'rgba(217, 240, 239, 0.7)',
  },
  bloomWash: {
    position: 'absolute',
    right: -90,
    top: 80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: glass.tintBloom,
  },
  skyWash: {
    position: 'absolute',
    left: -110,
    bottom: 40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: glass.tintSky,
  },
  panelShell: {
    overflow: 'hidden',
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
  panelFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  surfaceClear: {
    backgroundColor: glass.surface,
  },
  surfaceStrong: {
    backgroundColor: glass.surfaceStrong,
  },
  surfaceGreen: {
    backgroundColor: glass.tintGreen,
  },
  surfaceSky: {
    backgroundColor: glass.tintSky,
  },
  surfaceBloom: {
    backgroundColor: glass.tintBloom,
  },
  panelContent: {
    padding: 16,
  },
  cardShell: {
    borderRadius: radii.medium,
  },
  cardContent: {
    gap: 10,
  },
  floatingBar: {
    borderRadius: radii.round,
  },
  floatingBarContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
