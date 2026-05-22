import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { colors } from '../../theme/tokens';
import { resolveLaunchRoute } from './launchFlow';

const logoSource = require('../../../assets/brand/logo.png');
const leavesSource = require('../../../assets/brand/leaves.png');

type LeafTile = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: string;
  delay: number;
};

export function AppLaunchGate() {
  const auth = useAuth();
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hasNavigated = useRef(false);
  const logoProgress = useRef(new Animated.Value(0)).current;
  const route = resolveLaunchRoute(auth.status);
  const tiles = useMemo(() => buildLeafTiles(width, height), [height, width]);
  const leafProgress = useMemo(() => tiles.map(() => new Animated.Value(0)), [tiles]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    Animated.timing(logoProgress, {
      toValue: 1,
      duration: reduceMotion ? 180 : 680,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [logoProgress, reduceMotion]);

  useEffect(() => {
    if (!route || hasNavigated.current) {
      return;
    }

    hasNavigated.current = true;

    if (reduceMotion) {
      router.replace(route);
      setVisible(false);
      return;
    }

    const coverAnimations = leafProgress.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 540,
        delay: tiles[index]?.delay ?? 0,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    const uncoverAnimations = leafProgress
      .map((value, index) =>
        Animated.timing(value, {
          toValue: 0,
          duration: 520,
          delay: tiles[index]?.delay ?? 0,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        })
      )
      .reverse();

    Animated.sequence([
      Animated.delay(520),
      Animated.parallel(coverAnimations),
      Animated.delay(120),
    ]).start(() => {
      router.replace(route);
      Animated.sequence([Animated.delay(260), Animated.parallel(uncoverAnimations)]).start(() => {
        setVisible(false);
      });
    });
  }, [leafProgress, reduceMotion, route, tiles]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoProgress,
            transform: [
              {
                translateY: logoProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-18, -30],
                }),
              },
              {
                scale: logoProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Image source={logoSource} resizeMode="contain" style={styles.logo} />
      </Animated.View>

      <View style={styles.leafLayer}>
        {tiles.map((tile, index) => {
          const progress = leafProgress[index];
          return (
            <Animated.Image
              key={tile.key}
              source={leavesSource}
              resizeMode="cover"
              style={[
                styles.leafTile,
                {
                  left: tile.left,
                  top: tile.top,
                  width: tile.width,
                  height: tile.height,
                  opacity: progress,
                  transform: [
                    {
                      translateY: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-42, 0],
                      }),
                    },
                    {
                      scale: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.74, 1.24],
                      }),
                    },
                    { rotate: tile.rotate },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

function buildLeafTiles(width: number, height: number): LeafTile[] {
  const tileWidth = 132;
  const tileHeight = 96;
  const columns = Math.ceil(width / tileWidth) + 4;
  const rows = Math.ceil(height / tileHeight) + 5;
  const baseTileCount = rows * columns;

  return Array.from({ length: baseTileCount * 2 }, (_, index) => {
    const layer = index >= baseTileCount ? 1 : 0;
    const baseIndex = index % baseTileCount;
    const row = Math.floor(baseIndex / columns);
    const column = baseIndex % columns;
    const offset = row % 2 === 0 ? 0 : -tileWidth / 2;
    const drift = ((row * 19 + column * 11) % 23) - 11;
    const layerLeft = layer === 0 ? 0 : tileWidth * 0.42;
    const layerTop = layer === 0 ? 0 : tileHeight * 0.46;

    return {
      key: `leaf-${layer}-${row}-${column}`,
      left: column * tileWidth + offset - tileWidth + layerLeft,
      top: row * tileHeight - tileHeight * 2 + layerTop,
      width: tileWidth + 36,
      height: tileHeight + 32,
      rotate: `${((row * 13 + column * 17 + layer * 23) % 44) - 22}deg`,
      delay: row * 48 + column * 16 + layer * 18 + Math.max(drift, 0),
    };
  });
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: 'hidden',
    backgroundColor: colors.paper,
  },
  logoWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 178,
    height: 112,
  },
  leafLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  leafTile: {
    position: 'absolute',
  },
});
