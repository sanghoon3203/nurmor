import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingGlassBar } from '../atlas/glass';
import { colors, glass } from '../../theme/tokens';

type TabSymbol = 'book' | 'map' | 'camera' | 'eyes' | 'person';

const tabMeta: Record<string, { label: string; glyph: TabSymbol }> = {
  codex: { label: '도감', glyph: 'book' },
  index: { label: '지도', glyph: 'map' },
  record: { label: '기록', glyph: 'camera' },
  community: { label: '커뮤니티', glyph: 'eyes' },
  profile: { label: '마이페이지', glyph: 'person' },
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
                style={styles.item}
              >
                <View
                  style={[
                    styles.glyph,
                    focused ? styles.glyphFocused : null,
                  ]}
                >
                  <TabGlyph name={meta.glyph} active={focused} />
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

function TabGlyph({ name, active }: { name: TabSymbol; active: boolean }) {
  const symbol = name === 'book' ? '📘' : name === 'map' ? '🗺️' : name === 'camera' ? '📷' : name === 'eyes' ? '👀' : '👤';
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
    minHeight: 66,
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
  glyph: {
    width: 40,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  glyphFocused: {
    backgroundColor: 'rgba(109, 175, 69, 0.16)',
  },
  symbolText: {
    fontSize: 24,
    lineHeight: 28,
  },
  symbolTextActive: {
    transform: [{ scale: 1.04 }],
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
  },
  labelFocused: {
    color: colors.moss,
    fontWeight: '800',
  },
});
