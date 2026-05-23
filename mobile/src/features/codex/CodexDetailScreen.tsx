import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientScreen, RevealView } from '../atlas/glass';
import { useAuth } from '../auth/AuthProvider';
import { FirebaseCodexEntry, FirebaseCommunityDiscovery, listCodexEntries, listCommunityDiscoveries } from '../../services/firebaseAtlasDb';
import { colors, glass, radii } from '../../theme/tokens';
import { CodexFamily } from './codexViewModel';
import { buildSpeciesPhotoGallery, SpeciesPhoto, SpeciesReference } from './codexDetailViewModel';

const fallbackRegion = {
  latitude: 37.5665,
  longitude: 126.978,
  radiusKm: 10000,
};

export function CodexDetailScreen() {
  const params = useLocalSearchParams();
  const auth = useAuth();
  const selected = useMemo(() => selectedFromParams(params), [params]);
  const [remoteCodex, setRemoteCodex] = useState<FirebaseCodexEntry[]>([]);
  const [remoteDiscoveries, setRemoteDiscoveries] = useState<FirebaseCommunityDiscovery[]>([]);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSameSpeciesSources() {
      if (!auth.session?.idToken) {
        setRemoteCodex([]);
        setRemoteDiscoveries([]);
        setLoadMessage(null);
        return;
      }

      try {
        const [codex, discoveries] = await Promise.all([
          listCodexEntries(auth.session.idToken),
          listCommunityDiscoveries(auth.session.idToken, fallbackRegion),
        ]);
        if (!isMounted) {
          return;
        }
        setRemoteCodex(codex);
        setRemoteDiscoveries(discoveries);
        setLoadMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setRemoteCodex([]);
        setRemoteDiscoveries([]);
        setLoadMessage(error instanceof Error ? error.message : '같은 종 사진을 불러오지 못했습니다.');
      }
    }

    loadSameSpeciesSources();

    return () => {
      isMounted = false;
    };
  }, [auth.session?.idToken]);

  const photos = useMemo(
    () =>
      buildSpeciesPhotoGallery({
        selected,
        mine: remoteCodex.filter((entry) => entry.userId === auth.session?.localId).map(codexToSpeciesSource),
        publicSources: remoteDiscoveries.filter((entry) => entry.userId !== auth.session?.localId).map(discoveryToSpeciesSource),
      }),
    [auth.session?.localId, remoteCodex, remoteDiscoveries, selected]
  );
  // Real photos appear only after codex/community documents receive imageUrl.
  // Until then, the page keeps the same-species rule and shows safe placeholders.
  const displayPhotos = photos.length > 0 ? photos : fallbackPhotos(selected);
  const facts = factsForSpecies(selected);

  return (
    <GradientScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.topBar}>
              <Pressable accessibilityRole="button" style={styles.iconButton} onPress={() => router.back()}>
                <Text style={styles.topIcon}>‹</Text>
              </Pressable>
              <Text style={styles.topNumber}>{selected.displayNumber}</Text>
              <Pressable accessibilityRole="button" style={styles.iconButton}>
                <Text style={styles.moreIcon}>•••</Text>
              </Pressable>
            </View>
          </RevealView>

          <RevealView delay={60}>
            <View style={styles.heroCard}>
              <View style={styles.heroText}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {selected.title}
                  </Text>
                  <Text style={styles.leaf}>☘</Text>
                </View>
                <Text style={styles.scientific}>{selected.scientificName}</Text>
                <Text style={[styles.categoryBadge, badgeStyle(selected.category)]}>{selected.categoryLabel}</Text>

                <View style={styles.factStack}>
                  {facts.map((fact) => (
                    <View key={fact.label} style={styles.factRow}>
                      <View style={styles.factIcon}>
                        <Text style={styles.factIconText}>{fact.icon}</Text>
                      </View>
                      <View style={styles.factCopy}>
                        <Text style={styles.factLabel}>{fact.label}</Text>
                        <Text style={styles.factValue}>{fact.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.heroArt}>
                <View style={styles.plantAccentLeft} />
                <View style={styles.plantAccentRight} />
                {selected.imageUrl ? (
                  <Image source={{ uri: selected.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.heroSymbol}>{symbolForSpecies(selected)}</Text>
                )}
                <View style={styles.rockShadow} />
              </View>
            </View>
          </RevealView>

          <RevealView delay={100}>
            <DetailSection title={`${selected.categoryLabel} 설명`} icon="☘">
              <Text style={styles.description}>{descriptionForSpecies(selected)}</Text>
            </DetailSection>
          </RevealView>

          <RevealView delay={140}>
            <DetailSection title="같은 종 사진" icon="☘">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRail}>
                {displayPhotos.map((photo) => (
                  <PhotoTile key={photo.id} photo={photo} selected={selected} />
                ))}
              </ScrollView>
              {loadMessage ? <Text style={styles.loadMessage}>{loadMessage}</Text> : null}
            </DetailSection>
          </RevealView>

          <RevealView delay={180}>
            <DetailSection title="내가 녹음한 음성" icon="▶">
              <View style={styles.audioCard}>
                <View style={styles.playButton}>
                  <Text style={styles.playText}>▶</Text>
                </View>
                <View style={styles.waveform}>
                  {Array.from({ length: 26 }).map((_, index) => (
                    <View key={index} style={[styles.waveBar, { height: 8 + ((index * 7) % 22) }]} />
                  ))}
                </View>
                <Text style={styles.audioTime}>00:18</Text>
              </View>
            </DetailSection>
          </RevealView>

          <RevealView delay={220}>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.infoIconText}>⌖</Text>
                  </View>
                  <Text style={styles.infoTitle}>발견 지역</Text>
                </View>
                <Text style={styles.infoValue}>{selected.place}</Text>
                <View style={styles.miniMap}>
                  <View style={styles.mapWater} />
                  <View style={styles.mapPark} />
                  <View style={styles.mapPin}>
                    <Text style={styles.mapPinText}>●</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.infoIconText}>▣</Text>
                  </View>
                  <Text style={styles.infoTitle}>발견 날짜</Text>
                </View>
                <Text style={styles.dateValue}>{selected.date}</Text>
                <Text style={styles.timeValue}>오후 04:32</Text>
              </View>
            </View>
          </RevealView>

          <RevealView delay={260}>
            <View style={styles.actionRow}>
              <Pressable accessibilityRole="button" style={styles.shareButton}>
                <Text style={styles.shareText}>⌘ 기록 공유하기</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.saveButton}>
                <Text style={styles.saveText}>▱ 보관함에 추가</Text>
              </Pressable>
            </View>
          </RevealView>
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function DetailSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function PhotoTile({ photo, selected }: { photo: SpeciesPhoto; selected: SpeciesReference & DetailParams }) {
  return (
    <View style={styles.photoTile}>
      {'url' in photo && photo.url.startsWith('atlas-fallback://') ? (
        <View style={styles.fallbackPhoto}>
          <Text style={styles.fallbackPhotoSymbol}>{symbolForSpecies(selected)}</Text>
        </View>
      ) : (
        <Image source={{ uri: photo.url }} style={styles.photoImage} resizeMode="cover" />
      )}
      <Text style={styles.photoSource}>{photo.source === 'mine' ? '내 사진' : '공개 사진'}</Text>
    </View>
  );
}

type DetailParams = {
  displayNumber: string;
  category: Exclude<CodexFamily, 'ALL'>;
  categoryLabel: string;
  date: string;
  place: string;
};

function selectedFromParams(params: ReturnType<typeof useLocalSearchParams>): SpeciesReference & DetailParams {
  const title = stringParam(params.title, '수달');
  const scientificName = stringParam(params.scientificName, 'Lutra lutra');
  return {
    id: stringParam(params.id, 'selected-codex'),
    displayNumber: stringParam(params.displayNumber, 'No.001'),
    title,
    scientificName,
    speciesKey: stringParam(params.speciesKey, scientificName),
    category: categoryParam(params.category),
    categoryLabel: stringParam(params.categoryLabel, '동물'),
    date: stringParam(params.date, '2024.04.18'),
    place: stringParam(params.place, '잠실 3동, 석촌호수'),
    imageUrl: stringParam(params.imageUrl, '') || null,
  };
}

function codexToSpeciesSource(entry: FirebaseCodexEntry): SpeciesReference {
  return {
    id: entry.id,
    title: entry.displayName,
    scientificName: entry.scientificName,
    speciesKey: entry.speciesKey,
    imageUrl: entry.imageUrl,
  };
}

function discoveryToSpeciesSource(entry: FirebaseCommunityDiscovery): SpeciesReference {
  return {
    id: entry.id,
    title: entry.displayName,
    scientificName: entry.scientificName,
    speciesKey: entry.scientificName ?? entry.displayName,
    imageUrl: entry.imageUrl,
  };
}

function fallbackPhotos(selected: SpeciesReference): SpeciesPhoto[] {
  return [1, 2, 3].map((index) => ({
    id: `${selected.id}-fallback-${index}`,
    url: `atlas-fallback://${selected.id}/${index}`,
    source: index === 1 ? 'mine' : 'community',
  }));
}

function stringParam(value: unknown, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function categoryParam(value: unknown): Exclude<CodexFamily, 'ALL'> {
  const next = stringParam(value, 'ANIMAL');
  if (next === 'PLANT' || next === 'ANIMAL' || next === 'FISH' || next === 'INSECT' || next === 'OTHER') {
    return next;
  }
  return 'ANIMAL';
}

function symbolForSpecies(entry: SpeciesReference) {
  if (/수달|otter/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) return '🦦';
  if (/다람쥐|chipmunk|squirrel/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) return '🐿';
  if (/고슴도치|hedgehog/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) return '🦔';
  if (/개구리|frog/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) return '🐸';
  if (/새|sparrow|bird/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) return '🐦';
  if (/fish|붕어|어류/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) return '🐟';
  if (/insect|beetle|곤충|풍뎅이/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) return '🪲';
  return '🌿';
}

function factsForSpecies(entry: SpeciesReference) {
  if (/수달|otter|lutra/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) {
    return [
      { icon: '↕', label: '평균 크기', value: '60 - 90 cm' },
      { icon: '▣', label: '평균 몸무게', value: '5 - 10 kg' },
    ];
  }
  return [
    { icon: '↕', label: '관찰 크기', value: '현장 기록 기준' },
    { icon: '▣', label: '관찰 신뢰도', value: 'AI 추정 + 사용자 확인' },
  ];
}

function descriptionForSpecies(entry: SpeciesReference) {
  if (/수달|otter|lutra/i.test(`${entry.title} ${entry.scientificName ?? ''}`)) {
    return '수달은 깨끗한 물이 흐르는 하천, 호수, 습지 등에 서식하는 포유류예요. 날렵한 몸과 물갈퀴가 달린 발로 물속에서 빠르게 헤엄치며, 물고기와 갑각류, 양서류 등을 주로 먹고 살아요. 경계심이 많고 활동 반경이 넓어 관찰 기록이 서식지 건강을 이해하는 데 도움이 됩니다.';
  }
  return `${entry.title} 관찰 기록은 같은 종의 사진과 함께 모아져요. 실제 위치는 정확 좌표 대신 셀 단위 지역으로만 표시해 서식지와 관찰자의 정보를 보호합니다.`;
}

function badgeStyle(family: Exclude<CodexFamily, 'ALL'>) {
  switch (family) {
    case 'PLANT':
      return styles.badgePlant;
    case 'FISH':
      return styles.badgeFish;
    case 'INSECT':
      return styles.badgeInsect;
    case 'OTHER':
      return styles.badgeOther;
    default:
      return styles.badgeAnimal;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 34,
  },
  topBar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
  },
  topIcon: {
    color: colors.canopy,
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 39,
  },
  moreIcon: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },
  topNumber: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  heroCard: {
    minHeight: 354,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    padding: 22,
    backgroundColor: 'rgba(255, 253, 244, 0.9)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  heroText: {
    zIndex: 2,
    maxWidth: '52%',
    gap: 7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    color: colors.moss,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  leaf: {
    color: colors.moss,
    fontSize: 24,
    fontWeight: '900',
  },
  scientific: {
    color: '#747a72',
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '900',
  },
  badgePlant: {
    backgroundColor: '#e5f5cf',
    color: colors.moss,
  },
  badgeAnimal: {
    backgroundColor: '#e4f3d7',
    color: colors.moss,
  },
  badgeFish: {
    backgroundColor: colors.sky,
    color: '#276270',
  },
  badgeInsect: {
    backgroundColor: '#ece0ff',
    color: '#624893',
  },
  badgeOther: {
    backgroundColor: '#edf0eb',
    color: colors.muted,
  },
  factStack: {
    gap: 16,
    marginTop: 24,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factIcon: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f0eadc',
  },
  factIconText: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  factCopy: {
    gap: 3,
  },
  factLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  factValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  heroArt: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    width: '58%',
    height: 260,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroImage: {
    width: 210,
    height: 188,
    borderRadius: 26,
  },
  heroSymbol: {
    fontSize: 120,
    lineHeight: 132,
  },
  rockShadow: {
    width: 190,
    height: 20,
    marginTop: -8,
    borderRadius: radii.round,
    backgroundColor: 'rgba(109, 93, 63, 0.22)',
  },
  plantAccentLeft: {
    position: 'absolute',
    left: 7,
    bottom: 36,
    width: 38,
    height: 116,
    borderRadius: 24,
    backgroundColor: 'rgba(185, 227, 127, 0.32)',
    transform: [{ rotate: '-18deg' }],
  },
  plantAccentRight: {
    position: 'absolute',
    right: 6,
    bottom: 72,
    width: 33,
    height: 124,
    borderRadius: 24,
    backgroundColor: 'rgba(216, 199, 159, 0.34)',
    transform: [{ rotate: '18deg' }],
  },
  section: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    color: colors.moss,
    fontSize: 22,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 27,
    fontWeight: '800',
  },
  photoRail: {
    gap: 12,
  },
  photoTile: {
    width: 112,
    gap: 6,
  },
  photoImage: {
    width: 112,
    height: 112,
    borderRadius: 14,
    backgroundColor: colors.mint,
  },
  fallbackPhoto: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    backgroundColor: 'rgba(223, 241, 207, 0.7)',
  },
  fallbackPhotoSymbol: {
    fontSize: 52,
  },
  photoSource: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  loadMessage: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  audioCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255, 248, 232, 0.86)',
  },
  playButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.moss,
  },
  playText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  waveform: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.moss,
  },
  audioTime: {
    color: colors.moss,
    fontSize: 13,
    fontWeight: '900',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minHeight: 218,
    gap: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.07)',
    padding: 16,
    backgroundColor: 'rgba(255, 253, 244, 0.8)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f0eadc',
  },
  infoIconText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  infoTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  miniMap: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#efe8d8',
  },
  mapWater: {
    position: 'absolute',
    right: 16,
    top: -12,
    width: 30,
    height: 170,
    borderRadius: 18,
    backgroundColor: 'rgba(205, 238, 245, 0.9)',
    transform: [{ rotate: '12deg' }],
  },
  mapPark: {
    position: 'absolute',
    left: 22,
    bottom: 18,
    width: 94,
    height: 70,
    borderRadius: 18,
    backgroundColor: 'rgba(185, 227, 127, 0.56)',
    transform: [{ rotate: '-8deg' }],
  },
  mapPin: {
    position: 'absolute',
    left: '48%',
    top: '42%',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.moss,
  },
  mapPinText: {
    color: colors.white,
    fontSize: 16,
  },
  dateValue: {
    marginTop: 26,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  timeValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 94,
  },
  shareButton: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.moss,
  },
  shareText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  saveButton: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: 'rgba(255, 253, 244, 0.8)',
  },
  saveText: {
    color: colors.moss,
    fontSize: 16,
    fontWeight: '900',
  },
});
