import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { SpeciesCard, SpeciesDisplayGroup } from '../../types/species';
import { colors } from '../../theme/tokens';

type SpeciesCodexCardProps = {
  data: SpeciesCard;
  onFollow?: (codexEntryId: string) => void;
  onPress?: (data: SpeciesCard) => void;
};

export function SpeciesCodexCard({ data, onFollow, onPress }: SpeciesCodexCardProps) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]} onPress={() => onPress?.(data)}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{getGroupIcon(data.displayGroup)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.displayName} numberOfLines={1}>
            {data.displayName}
          </Text>
          {data.scientificName ? (
            <Text style={styles.scientificName} numberOfLines={1}>
              {data.scientificName}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.imageContainer}>
        {data.imageUrl ? (
          <Image source={{ uri: data.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{getGroupIcon(data.displayGroup)}</Text>
          </View>
        )}

        <BlurView intensity={72} tint="dark" style={styles.overlay}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>지역</Text>
          </View>
          <Text style={styles.regionName} numberOfLines={1}>
            {data.regionName}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {data.description}
          </Text>
        </BlurView>

        {onFollow ? (
          <BlurView intensity={42} tint="light" style={styles.followBtn}>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => onFollow(data.codexEntryId)}>
              <Text style={styles.followText}>Follow +</Text>
            </Pressable>
          </BlurView>
        ) : null}
      </View>
    </Pressable>
  );
}

function getGroupIcon(group: SpeciesDisplayGroup): string {
  const map: Record<SpeciesDisplayGroup, string> = {
    MAMMAL: '🐾',
    BIRD: '🐦',
    FISH: '🐟',
    PLANT: '🌿',
    INSECT: '🐛',
    REPTILE: '🦎',
    AMPHIBIAN: '🐸',
    FUNGI: '🍄',
    ANIMAL: '🐾',
    OTHER: '🔬',
  };
  return map[group] ?? '🔬';
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    width: 350,
    maxWidth: '100%',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eeeeee',
    padding: 16,
    backgroundColor: '#fffdf4',
    shadowColor: colors.canopy,
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#fff8e5',
  },
  icon: {
    fontSize: 21,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  displayName: {
    color: '#070707',
    fontSize: 16,
    fontWeight: '600',
  },
  scientificName: {
    color: '#b4b4b4',
    fontSize: 11,
    fontWeight: '400',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    borderRadius: 24,
    position: 'relative',
    backgroundColor: 'rgba(255, 248, 232, 0.55)',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.86,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(223, 241, 207, 0.7)',
  },
  placeholderText: {
    fontSize: 92,
    lineHeight: 104,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 130,
    overflow: 'hidden',
    borderRadius: 24,
    paddingLeft: 22,
    paddingTop: 14,
    paddingRight: 94,
    backgroundColor: 'rgba(23, 34, 25, 0.34)',
  },
  tag: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(206, 105, 33, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  tagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  regionName: {
    marginTop: 9,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    marginTop: 6,
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '300',
  },
  followBtn: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    minWidth: 72,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
  },
  followText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});
