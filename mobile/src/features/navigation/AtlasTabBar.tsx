import type { ComponentType } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import CommunityIcon from '../../../assets/navIcon/comunity_icon.svg';
import DexIcon from '../../../assets/navIcon/dex_icon.svg';
import MapIcon from '../../../assets/navIcon/map_icon.svg';
import MyPageIcon from '../../../assets/navIcon/myPage_icon.svg';
import SearchIcon from '../../../assets/navIcon/search_icon.svg';
import { colors } from '../../theme/tokens';

type TabSymbol = 'dex' | 'map' | 'record' | 'community' | 'profile';

const tabMeta: Record<string, { label: string; glyph: TabSymbol }> = {
  codex: { label: '\uB3C4\uAC10', glyph: 'dex' },
  index: { label: '\uC9C0\uB3C4', glyph: 'map' },
  record: { label: '\uAE30\uB85D', glyph: 'record' },
  community: { label: '\uCEE4\uBBA4\uB2C8\uD2F0', glyph: 'community' },
  profile: { label: '\uB9C8\uC774', glyph: 'profile' },
};

const iconBySymbol: Record<TabSymbol, ComponentType<SvgProps>> = {
  dex: DexIcon,
  map: MapIcon,
  record: SearchIcon,
  community: CommunityIcon,
  profile: MyPageIcon,
};

export function AtlasTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key]?.options;
          const meta = tabMeta[route.name] ?? { label: options?.title ?? route.name, glyph: 'map' as const };

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
              <View style={[styles.iconSlot, focused ? styles.iconSlotFocused : null]}>
                <TabGlyph name={meta.glyph} active={focused} />
              </View>
              <Text style={[styles.label, focused ? styles.labelFocused : null]} numberOfLines={1}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TabGlyph({ name, active }: { name: TabSymbol; active: boolean }) {
  const Icon = iconBySymbol[name];

  return (
    <Icon
      width={active ? 42 : 36}
      height={active ? 42 : 36}
      opacity={active ? 1 : 0.72}
      style={active ? styles.iconActive : styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
  },
  bar: {
    minHeight: 92,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 12,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOpacity: 0.13,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  item: {
    flex: 1,
    minWidth: 0,
    height: 66,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5,
  },
  iconSlot: {
    width: 52,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconSlotFocused: {
    backgroundColor: 'rgba(223, 241, 207, 0.9)',
  },
  icon: {
    transform: [{ scale: 1 }],
  },
  iconActive: {
    transform: [{ scale: 1.04 }],
  },
  label: {
    color: '#647061',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
  labelFocused: {
    color: colors.moss,
  },
});
