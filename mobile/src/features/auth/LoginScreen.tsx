import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard, GlassPanel, GradientScreen, RevealView } from '../atlas/glass';
import { useAuth } from './AuthProvider';
import { colors, radii } from '../../theme/tokens';

export function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const continueAnonymously = async () => {
    await auth.signIn();
    router.replace('/(tabs)/profile');
  };

  return (
    <GradientScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>A</Text>
              </View>
              <Text style={styles.title}>Atlas 로그인</Text>
              <Text style={styles.subtitle}>내 생태 지도와 도감 기록을 이어서 관리합니다.</Text>
            </View>
          </RevealView>

          <RevealView delay={100}>
            <GlassPanel tone="strong" contentStyle={styles.form}>
              <Field label="이메일" value={email} onChangeText={setEmail} placeholder="atlas@example.com" />
              <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder="비밀번호" secureTextEntry />

              <Pressable
                accessibilityRole="button"
                disabled={!canSubmit}
                style={[styles.primaryButton, !canSubmit ? styles.disabled : null]}
                onPress={() => router.replace('/(tabs)/profile')}
              >
                <Text style={styles.primaryButtonText}>로그인</Text>
              </Pressable>

              <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={continueAnonymously}>
                <Text style={styles.secondaryButtonText}>둘러보기</Text>
              </Pressable>
            </GlassPanel>
          </RevealView>

          <GlassCard tone="bloom">
            <Text style={styles.noteTitle}>현재 기능 범위</Text>
            <Text style={styles.noteBody}>이 화면은 계정 UI shell입니다. 실제 이메일 로그인은 Firebase provider 연결 단계에서 활성화하고, 지금은 익명 세션으로 앱을 사용할 수 있습니다.</Text>
          </GlassCard>

          <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => router.replace('/signup')}>
            <Text style={styles.linkText}>계정 만들기</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 18,
    padding: 20,
  },
  brand: {
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 37,
    backgroundColor: colors.canopy,
  },
  brandMarkText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '900',
  },
  title: {
    color: colors.canopy,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    maxWidth: 290,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '700',
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 7,
  },
  label: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  input: {
    minHeight: 52,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.canopy,
  },
  disabled: {
    opacity: 0.52,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  secondaryButtonText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '900',
  },
  noteTitle: {
    color: colors.canopy,
    fontSize: 16,
    fontWeight: '900',
  },
  noteBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
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
});
