import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPublicEnv } from '../../config/env';
import { GlassCard, GlassPanel, GradientScreen, RevealView } from '../atlas/glass';
import { StatusBadge } from '../atlas/ui';
import { useAuth } from '../auth/AuthProvider';
import { FirebaseUserProfile, getOrCreateUserProfile } from '../../services/firebaseAtlasDb';
import { colors, radii } from '../../theme/tokens';

export function ProfileScreen() {
  const auth = useAuth();
  const env = getPublicEnv();
  const [profile, setProfile] = useState<FirebaseUserProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const displayName = profile?.displayName ?? (auth.status === 'authenticated' ? 'Atlas 탐험가' : '로그인 확인 중');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!auth.session?.idToken || !auth.session.localId) {
        setProfile(null);
        setProfileStatus('idle');
        setProfileMessage(null);
        return;
      }

      setProfileStatus('loading');
      setProfileMessage(null);
      try {
        const nextProfile = await getOrCreateUserProfile(auth.session.idToken, {
          uid: auth.session.localId,
          email: null,
          displayName: null,
        });
        if (!isMounted) {
          return;
        }
        setProfile(nextProfile);
        setProfileStatus('ready');
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setProfile(null);
        setProfileStatus('error');
        setProfileMessage(error instanceof Error ? error.message : 'Firestore 프로필을 불러오지 못했습니다.');
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [auth.session?.idToken, auth.session?.localId]);

  return (
    <GradientScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.header}>
              <Text style={styles.kicker}>Atlas 계정</Text>
              <Text style={styles.title}>마이</Text>
              <Text style={styles.subtitle}>기록 공개 범위와 기여자 표시 방식을 관리합니다.</Text>
            </View>
          </RevealView>

          <RevealView delay={80}>
            <GlassPanel tone="green" contentStyle={styles.identityPanel}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.identityBody}>
                <Text style={styles.identityTitle}>{displayName}</Text>
                <Text style={styles.identityMeta}>{auth.session?.localId ? shortenUid(auth.session.localId) : auth.status}</Text>
              </View>
              <StatusBadge label={profileStatus === 'ready' ? 'Firestore' : auth.status === 'authenticated' ? '연결됨' : '확인'} tone={profileStatus === 'ready' ? 'blue' : 'green'} />
            </GlassPanel>
          </RevealView>

          <View style={styles.buttonRow}>
            <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push('/login')}>
              <Text style={styles.primaryButtonText}>로그인</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.push('/signup')}>
              <Text style={styles.secondaryButtonText}>회원가입</Text>
            </Pressable>
          </View>

          <View style={styles.statGrid}>
            <StatBox label="보고횟수" value={profile?.reportCount ?? 0} />
            <StatBox label="발견생물" value={profile?.speciesCount ?? 0} />
            <StatBox label="업적달성" value={profile?.achievementCount ?? 0} />
          </View>

          <GlassCard tone="strong">
            <Text style={styles.cardTitle}>기여자 표시</Text>
            <Text style={styles.cardBody}>
              기본값은 익명입니다. 현재 설정은 {profile?.publicContributor ? '셀 도감에 이름 표시' : '이름 비공개'} 상태입니다.
            </Text>
            <View style={styles.preferenceGrid}>
              <View style={styles.preference}>
                <Text style={styles.preferenceTitle}>정확 좌표</Text>
                <Text style={styles.preferenceBody}>비공개</Text>
              </View>
              <View style={styles.preference}>
                <Text style={styles.preferenceTitle}>공개 위치</Text>
                <Text style={styles.preferenceBody}>셀 단위</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard tone="sky">
            <Text style={styles.cardTitle}>Firebase 연결</Text>
            <Text style={styles.cardBody}>프로젝트 {env.firebaseProjectId || '미설정'} · Storage {env.firebaseStorageBucket || '미설정'}</Text>
            <Text style={styles.cardBody}>Spring API는 {env.atlasApiBaseUrl || '현재 비활성화'} 상태입니다.</Text>
            <Pressable accessibilityRole="button" style={styles.checkButton} onPress={() => void auth.signIn()}>
              <Text style={styles.checkButtonText}>Firebase 세션 다시 확인</Text>
            </Pressable>
          </GlassCard>

          {profileStatus === 'error' ? (
            <GlassCard tone="bloom">
              <Text style={styles.errorTitle}>프로필 동기화 오류</Text>
              <Text style={styles.cardBody}>{profileMessage}</Text>
            </GlassCard>
          ) : null}

          {auth.errorMessage ? (
            <GlassCard tone="bloom">
              <Text style={styles.errorTitle}>인증 오류</Text>
              <Text style={styles.cardBody}>{auth.errorMessage}</Text>
            </GlassCard>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function shortenUid(uid: string) {
  if (uid.length <= 14) {
    return uid;
  }
  return `${uid.slice(0, 7)}...${uid.slice(-5)}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 124,
  },
  header: {
    gap: 6,
    paddingTop: 8,
  },
  kicker: {
    color: colors.moss,
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    color: colors.canopy,
    fontSize: 40,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  identityPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: colors.canopy,
  },
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
  },
  identityBody: {
    flex: 1,
    gap: 4,
  },
  identityTitle: {
    color: colors.canopy,
    fontSize: 17,
    fontWeight: '900',
  },
  identityMeta: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    minHeight: 78,
    justifyContent: 'center',
    gap: 5,
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
  },
  statValue: {
    color: colors.canopy,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  statLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.canopy,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
  },
  secondaryButtonText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '900',
  },
  cardTitle: {
    color: colors.canopy,
    fontSize: 17,
    fontWeight: '900',
  },
  cardBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  preferenceGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  preference: {
    flex: 1,
    gap: 5,
    borderRadius: radii.medium,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
  },
  preferenceTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  preferenceBody: {
    color: colors.canopy,
    fontSize: 16,
    fontWeight: '900',
  },
  checkButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.leaf,
  },
  checkButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '900',
  },
});
