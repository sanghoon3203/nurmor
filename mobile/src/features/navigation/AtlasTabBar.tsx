import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingGlassBar } from '../atlas/glass';
import { colors, glass } from '../../theme/tokens';

const tabMeta: Record<string, { label: string; glyph: string; primary?: boolean }> = {
  codex: { label: '도감', glyph: '도' },
  index: { label: '홈', glyph: '홈' },
  record: { label: '기록', glyph: '+', primary: true },
  community: { label: '커뮤니티', glyph: '근' },
  profile: { label: '마이', glyph: '나' },
};

export function AtlasTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <FloatingGlassBar style={styles.bar}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key]?.options;
            const meta = tabMeta[route.name] ?? { label: options?.title ?? route.name, glyph: route.name.slice(0, 1) };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                key={route.key}
                onPress={onPress}
                style={[styles.item, meta.primary ? styles.primaryItem : null]}
              >
                <View
                  style={[
                    styles.glyph,
                    focused ? styles.glyphFocused : null,
                    meta.primary ? styles.primaryGlyph : null,
                    meta.primary && focused ? styles.primaryGlyphFocused : null,
                  ]}
                >
                  <Text style={[styles.glyphText, focused ? styles.glyphTextFocused : null, meta.primary ? styles.primaryGlyphText : null]}>
                    {meta.glyph}
                  </Text>
                </View>
                <Text style={[styles.label, focused ? styles.labelFocused : null]} numberOfLines={1}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FloatingGlassBar>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
  },
  bar: {
    borderColor: glass.border,
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  primaryItem: {
    transform: [{ translateY: -12 }],
  },
  glyph: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
  },
  glyphFocused: {
    backgroundColor: colors.canopy,
  },
  primaryGlyph: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: colors.leaf,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryGlyphFocused: {
    backgroundColor: colors.bloom,
  },
  glyphText: {
    color: colors.canopy,
    fontSize: 12,
    fontWeight: '900',
  },
  glyphTextFocused: {
    color: colors.white,
  },
  primaryGlyphText: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 30,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  labelFocused: {
    color: colors.canopy,
  },
});
