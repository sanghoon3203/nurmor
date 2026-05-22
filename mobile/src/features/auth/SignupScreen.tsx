import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RevealView } from '../atlas/glass';
import { AtlasLeaves, AtlasLogoSum } from '../brand/BrandAssets';
import { AuthSocialButton } from './AuthSocialButton';
import { useAuth } from './AuthProvider';
import { colors, glass } from '../../theme/tokens';

export function SignupScreen() {
  const auth = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showContributorName, setShowContributorName] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const canSubmit = nickname.trim().length > 1 && email.trim().length > 0 && password.length > 0;
  const errorMessage = localError ?? auth.errorMessage;

  const runAuthAction = async (key: string, action: () => Promise<void>, route: '/(tabs)' | '/(tabs)/profile' = '/(tabs)/profile') => {
    try {
      setSubmitting(key);
      setLocalError(null);
      await action();
      router.replace(route);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : '회원가입을 완료하지 못했습니다.');
    } finally {
      setSubmitting(null);
    }
  };

  const createEmailAccount = async () => {
    await runAuthAction('email', () => auth.signUpWithPassword(email, password));
  };

  const connectGoogle = async () => {
    await runAuthAction('google', () => auth.signInWithGoogle());
  };

  const continueAnonymously = async () => {
    await runAuthAction('guest', () => auth.signIn({ persist: false }), '/(tabs)');
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={styles.topLeaves}>
          <AtlasLeaves width="100%" height="100%" />
        </View>
        <View pointerEvents="none" style={styles.bottomLeaves}>
          <AtlasLeaves width="100%" height="100%" />
        </View>
        <View pointerEvents="none" style={styles.seedBlob} />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.brand}>
              <AtlasLogoSum width={184} height={83} />
              <Text style={styles.subtitle}>처음 발견을 심을 준비</Text>
            </View>
          </RevealView>

          <RevealView delay={100}>
            <View style={styles.formShell}>
              <Text style={styles.title}>회원가입</Text>

              <Field icon="잎" value={nickname} onChangeText={setNickname} placeholder="도감에 남길 이름" />
              <Field icon="@" value={email} onChangeText={setEmail} placeholder="이메일" keyboardType="email-address" />
              <Field
                icon="⌕"
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                secureTextEntry={!showPassword}
                rightLabel={showPassword ? '숨김' : '보기'}
                onRightPress={() => setShowPassword((current) => !current)}
              />

              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <Text style={styles.switchTitle}>기여자 이름 표시</Text>
                  <Text style={styles.switchBody}>켜면 셀 도감과 커뮤니티에 닉네임이 표시됩니다.</Text>
                </View>
                <Switch
                  value={showContributorName}
                  onValueChange={setShowContributorName}
                  trackColor={{ false: colors.line, true: colors.sprout }}
                  thumbColor={colors.white}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={!canSubmit || submitting !== null}
                style={[styles.primaryButton, !canSubmit || submitting !== null ? styles.disabled : null]}
                onPress={createEmailAccount}
              >
                <Text style={styles.primaryButtonText}>{submitting === 'email' ? '계정 만드는 중' : '계정 만들기'}</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              <AuthSocialButton label={submitting === 'google' ? 'Google 연결 중' : 'Google로 회원가입'} mark="G" disabled={submitting !== null} onPress={connectGoogle} />

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <Pressable accessibilityRole="button" disabled={submitting !== null} style={styles.guestButton} onPress={continueAnonymously}>
                <Text style={styles.guestButtonText}>익명으로 먼저 둘러보기</Text>
              </Pressable>
            </View>
          </RevealView>

          <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => router.replace('/login')}>
            <Text style={styles.linkText}>이미 계정이 있습니다</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Field({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  rightLabel,
  onRightPress,
}: {
  icon: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  rightLabel?: string;
  onRightPress?: () => void;
}) {
  return (
    <View style={styles.inputShell}>
      <Text style={styles.inputIcon}>{icon}</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
      {rightLabel && onRightPress ? (
        <Pressable accessibilityRole="button" style={styles.inputAction} onPress={onRightPress}>
          <Text style={styles.inputActionText}>{rightLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 34,
    paddingHorizontal: 28,
    paddingVertical: 34,
  },
  brand: {
    alignItems: 'flex-start',
    gap: 12,
    paddingLeft: 10,
  },
  subtitle: {
    color: colors.leaf,
    fontSize: 17,
    fontWeight: '900',
  },
  formShell: {
    overflow: 'hidden',
    gap: 14,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: glass.border,
    paddingHorizontal: 26,
    paddingTop: 32,
    paddingBottom: 26,
    backgroundColor: 'rgba(248, 255, 249, 0.78)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  inputShell: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 18,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  inputIcon: {
    width: 21,
    color: colors.moss,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    minHeight: 54,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  inputAction: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  inputActionText: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: '900',
  },
  switchRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
  },
  switchText: {
    flex: 1,
    gap: 4,
  },
  switchTitle: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '900',
  },
  switchBody: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.canopy,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  disabled: {
    opacity: 0.56,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(37, 50, 37, 0.22)',
  },
  dividerText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  guestButton: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  linkButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '900',
  },
  topLeaves: {
    position: 'absolute',
    right: -32,
    top: 38,
    width: 168,
    height: 118,
    opacity: 0.16,
    transform: [{ rotate: '-16deg' }],
  },
  bottomLeaves: {
    position: 'absolute',
    left: -54,
    bottom: -22,
    width: 232,
    height: 168,
    opacity: 0.22,
    transform: [{ rotate: '14deg' }],
  },
  seedBlob: {
    position: 'absolute',
    right: 34,
    top: 132,
    width: 118,
    height: 78,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 44,
    borderBottomRightRadius: 86,
    borderBottomLeftRadius: 10,
    backgroundColor: colors.sprout,
    opacity: 0.86,
    transform: [{ rotate: '-12deg' }],
  },
});
