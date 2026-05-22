import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RevealView } from '../atlas/glass';
import { useAuth } from './AuthProvider';
import { colors, glass, radii } from '../../theme/tokens';

const logoSource = require('../../../assets/brand/logo.png');
const leavesSource = require('../../../assets/brand/leaves.png');

export function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const connectSession = async () => {
    await auth.signIn();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={styles.topLeaves}>
          <Image source={leavesSource} resizeMode="contain" style={styles.decorImage} />
        </View>
        <View pointerEvents="none" style={styles.bottomLeaves}>
          <Image source={leavesSource} resizeMode="contain" style={styles.decorImage} />
        </View>
        <View pointerEvents="none" style={styles.topBlob} />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.brand}>
              <Image source={logoSource} resizeMode="contain" style={styles.logo} />
              <Text style={styles.subtitle}>참여형 생태 커뮤니티</Text>
            </View>
          </RevealView>

          <RevealView delay={100}>
            <View style={styles.formShell}>
              <Text style={styles.title}>로그인</Text>

              <Field
                icon="○"
                value={email}
                onChangeText={setEmail}
                placeholder="아이디 또는 이메일"
                keyboardType="email-address"
              />
              <Field
                icon="⌕"
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                secureTextEntry={!showPassword}
                rightLabel={showPassword ? '숨김' : '보기'}
                onRightPress={() => setShowPassword((current) => !current)}
              />

              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: autoLogin }} style={styles.checkRow} onPress={() => setAutoLogin((current) => !current)}>
                <View style={[styles.checkbox, autoLogin ? styles.checkboxSelected : null]}>
                  {autoLogin ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={styles.checkLabel}>자동 로그인</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={!canSubmit}
                style={[styles.primaryButton, !canSubmit ? styles.disabled : null]}
                onPress={connectSession}
              >
                <Text style={styles.primaryButtonText}>로그인</Text>
              </Pressable>

              <Pressable accessibilityRole="button" style={styles.joinButton} onPress={() => router.replace('/signup')}>
                <Text style={styles.joinButtonText}>회원가입</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              <SocialButton label="Google로 로그인하기" mark="G" onPress={connectSession} />
              <SocialButton label="Apple로 로그인하기" mark="" variant="dark" onPress={connectSession} />
              <SocialButton label="이메일로 로그인하기" mark="✉" onPress={connectSession} />

              <Pressable accessibilityRole="button" style={styles.guestButton} onPress={connectSession}>
                <Text style={styles.guestButtonText}>둘러보기</Text>
              </Pressable>
            </View>
          </RevealView>
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

function SocialButton({
  label,
  mark,
  variant = 'light',
  onPress,
}: {
  label: string;
  mark: string;
  variant?: 'light' | 'dark';
  onPress: () => void;
}) {
  const dark = variant === 'dark';
  return (
    <Pressable accessibilityRole="button" style={[styles.socialButton, dark ? styles.socialButtonDark : null]} onPress={onPress}>
      <Text style={[styles.socialMark, dark ? styles.socialMarkDark : null]}>{mark}</Text>
      <Text style={[styles.socialText, dark ? styles.socialTextDark : null]}>{label}</Text>
    </Pressable>
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
    gap: 42,
    paddingHorizontal: 28,
    paddingVertical: 34,
  },
  brand: {
    alignItems: 'flex-start',
    gap: 12,
    paddingLeft: 10,
  },
  logo: {
    width: 184,
    height: 83,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
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
    backgroundColor: 'rgba(248, 255, 249, 0.74)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
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
    width: 19,
    color: colors.moss,
    fontSize: 16,
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
  checkRow: {
    alignSelf: 'flex-start',
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  checkMark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  checkLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
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
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  joinButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.leaf,
  },
  joinButtonText: {
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
  socialButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(22, 63, 45, 0.08)',
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  socialButtonDark: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  socialMark: {
    width: 24,
    color: colors.canopy,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  socialMarkDark: {
    color: colors.white,
  },
  socialText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  socialTextDark: {
    color: colors.white,
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
  topBlob: {
    position: 'absolute',
    right: 42,
    top: 118,
    width: 120,
    height: 84,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 80,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 84,
    backgroundColor: colors.leaf,
    transform: [{ rotate: '4deg' }],
  },
  topLeaves: {
    position: 'absolute',
    right: -26,
    top: 34,
    width: 154,
    height: 112,
    opacity: 0.16,
    transform: [{ rotate: '-18deg' }],
  },
  bottomLeaves: {
    position: 'absolute',
    left: -44,
    bottom: -18,
    width: 220,
    height: 160,
    opacity: 0.24,
    transform: [{ rotate: '16deg' }],
  },
  decorImage: {
    width: '100%',
    height: '100%',
  },
});
