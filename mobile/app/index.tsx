import { StyleSheet, Text, View } from 'react-native';

const nextSteps = [
  'Firebase anonymous sign-in and ID token handshake',
  'Atlas API health and authenticated nearby-cell request',
  'Foreground location permission and map-centered home',
  'Photo capture or picker to Firebase Storage',
];

export default function Index() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Atlas</Text>
        <Text style={styles.subtitle}>Living habitat codex mobile MVP</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Frontend build order</Text>
        {nextSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Backend target: {process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL ?? 'not configured'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 64,
    backgroundColor: '#f6fbf4',
  },
  header: {
    gap: 12,
  },
  title: {
    color: '#172219',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    maxWidth: 260,
    color: '#4f614f',
    fontSize: 18,
    lineHeight: 25,
  },
  panel: {
    gap: 18,
    borderWidth: 1,
    borderColor: '#d4e5cf',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#ffffff',
  },
  panelTitle: {
    color: '#233024',
    fontSize: 18,
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#194d36',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
  stepText: {
    flex: 1,
    color: '#243325',
    fontSize: 15,
    lineHeight: 21,
  },
  footer: {
    color: '#687768',
    fontSize: 13,
    lineHeight: 18,
  },
});
