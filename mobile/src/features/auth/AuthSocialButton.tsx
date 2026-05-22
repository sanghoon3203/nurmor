import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/tokens';

export function AuthSocialButton({
  label,
  mark,
  variant = 'light',
  disabled = false,
  onPress,
}: {
  label: string;
  mark: string;
  variant?: 'light' | 'dark';
  disabled?: boolean;
  onPress: () => void;
}) {
  const dark = variant === 'dark';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.socialButton, dark ? styles.socialButtonDark : null, disabled ? styles.disabled : null]}
      onPress={onPress}
    >
      <Text style={[styles.socialMark, dark ? styles.socialMarkDark : null]}>{mark}</Text>
      <Text style={[styles.socialText, dark ? styles.socialTextDark : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  disabled: {
    opacity: 0.54,
  },
});
