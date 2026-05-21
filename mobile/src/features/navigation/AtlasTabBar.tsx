import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingGlassBar } from '../atlas/glass';
import { colors, glass } from '../../theme/tokens';

type TabSymbol = 'book' | 'home' | 'leaf' | 'people' | 'person';

const tabMeta: Record<string, { label: string; glyph: TabSymbol; primary?: boolean }> = {
  codex: { label: '도감', glyph: 'book' },
  index: { label: '홈', glyph: 'home' },
  record: { label: '기록', glyph: 'leaf', primary: true },
  community: { label: '커뮤니티', glyph: 'people' },
  profile: { label: '마이', glyph: 'person' },
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
            const meta = tabMeta[route.name] ?? { label: options?.title ?? route.name, glyph: 'home' as const };

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
                  <TabGlyph name={meta.glyph} active={focused} primary={meta.primary} />
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

function TabGlyph({ name, active, primary }: { name: TabSymbol; active: boolean; primary?: boolean }) {
  if (name === 'leaf') {
    return (
      <View style={styles.leafSymbol}>
        <View style={[styles.leafBlade, primary && active ? styles.leafBladePrimaryActive : null]} />
        <View style={[styles.leafStem, primary && active ? styles.leafStemPrimaryActive : null]} />
      </View>
    );
  }

  const symbol = name === 'book' ? '▱' : name === 'home' ? '⌂' : name === 'people' ? '○○' : '○';
  return <Text style={[styles.symbolText, active ? styles.symbolTextActive : null]}>{symbol}</Text>;
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
    backgroundColor: glass.surfaceChrome,
  },
  row: {
    minHeight: 68,
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
    gap: 5,
  },
  primaryItem: {
    transform: [{ translateY: -15 }],
  },
  glyph: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'transparent',
  },
  glyphFocused: {
    backgroundColor: 'rgba(109, 175, 69, 0.13)',
  },
  primaryGlyph: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  primaryGlyphFocused: {
    backgroundColor: 'rgba(223, 241, 207, 0.96)',
  },
  symbolText: {
    color: colors.canopy,
    fontSize: 25,
    fontWeight: '500',
    lineHeight: 27,
  },
  symbolTextActive: {
    color: colors.moss,
  },
  leafSymbol: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafBlade: {
    width: 30,
    height: 20,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 3,
    borderColor: colors.moss,
    transform: [{ rotate: '-38deg' }],
  },
  leafBladePrimaryActive: {
    borderColor: colors.moss,
  },
  leafStem: {
    position: 'absolute',
    width: 3,
    height: 30,
    borderRadius: 2,
    backgroundColor: colors.moss,
    transform: [{ rotate: '42deg' }, { translateY: 5 }],
  },
  leafStemPrimaryActive: {
    backgroundColor: colors.moss,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  labelFocused: {
    color: colors.moss,
    fontWeight: '800',
  },
});
