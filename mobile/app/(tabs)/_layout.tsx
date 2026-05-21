import { Tabs } from 'expo-router';

import { AtlasTabBar } from '../../src/features/navigation/AtlasTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <AtlasTabBar {...props} />}
    >
      <Tabs.Screen name="codex" options={{ title: '도감' }} />
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="record" options={{ title: '기록' }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티' }} />
      <Tabs.Screen name="profile" options={{ title: '마이' }} />
    </Tabs>
  );
}
