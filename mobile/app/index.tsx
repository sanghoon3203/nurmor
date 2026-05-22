import { StyleSheet, View } from 'react-native';

import { colors } from '../src/theme/tokens';

export default function LaunchRoute() {
  return <View style={styles.screen} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
