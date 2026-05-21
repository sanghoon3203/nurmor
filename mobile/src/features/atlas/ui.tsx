import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { bloomColors, colors, glass, radii } from '../../theme/tokens';
import { AtlasCodexEntry } from './mockData';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function AtlasButton({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
        disabled ? styles.disabledButton : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.buttonText, variant === 'secondary' ? styles.secondaryButtonText : null]}>{label}</Text>
    </Pressable>
  );
}

export function StepHeader({
  step,
  title,
  subtitle,
  action,
}: {
  step: number;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.stepHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{step}</Text>
      </View>
      <View style={styles.stepTextGroup}>
        <Text style={styles.stepTitle}>{title}</Text>
        {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.stepAction}>{action}</View> : null}
    </View>
  );
}

export function SoftPanel({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'paper' | 'green' }) {
  return <View style={[styles.softPanel, tone === 'paper' ? styles.paperPanel : null, tone === 'green' ? styles.greenPanel : null]}>{children}</View>;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, selected ? styles.segmentSelected : null]}
          >
            <Text style={[styles.segmentText, selected ? styles.segmentTextSelected : null]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}

export function StatusBadge({ label, tone = 'green' }: { label: string; tone?: 'green' | 'blue' | 'yellow' }) {
  const toneStyle = tone === 'blue' ? styles.badgeBlue : tone === 'yellow' ? styles.badgeYellow : styles.badgeGreen;
  return (
    <View style={[styles.badge, toneStyle]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function CodexEntryCard({ entry }: { entry: AtlasCodexEntry }) {
  return (
    <View style={styles.codexCard}>
      <View style={[styles.entryThumb, entry.tone === 'butterfly' ? styles.thumbBloom : entry.tone === 'bird' ? styles.thumbSky : styles.thumbLeaf]}>
        <Text style={styles.entryThumbText}>{entry.tone === 'bird' ? '새' : entry.tone === 'flower' ? '꽃' : '나비'}</Text>
      </View>
      <View style={styles.entryBody}>
        <View style={styles.entryTitleRow}>
          <Text numberOfLines={1} style={styles.entryTitle}>
            {entry.title}
          </Text>
          {entry.isLatest ? <StatusBadge label="최신" tone="yellow" /> : null}
        </View>
        <Text style={styles.entryScientific}>신뢰도 {entry.confidence}% · {entry.date}</Text>
        <Text style={styles.entryMeta}>기여자 {entry.contributor}</Text>
      </View>
    </View>
  );
}

export function CellGlyph({ state, selected = false }: { state: string; selected?: boolean }) {
  return (
    <View style={[styles.cellGlyph, { backgroundColor: bloomColors[state] ?? colors.mint }, selected ? styles.cellGlyphSelected : null]}>
      <View style={styles.cellGlyphInner}>
        <Text style={styles.cellGlyphText}>{state === 'BLOOMED' ? '꽃' : state === 'GROWING' ? '잎' : state === 'SEEDED' ? '싹' : state === 'VISITED' ? '발' : ''}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  primaryButton: {
    borderColor: colors.leaf,
    backgroundColor: colors.leaf,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  secondaryButton: {
    borderColor: glass.hairline,
    backgroundColor: 'rgba(255, 255, 255, 0.64)',
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  secondaryButtonText: {
    color: colors.canopy,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: colors.leaf,
  },
  stepBadgeText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  stepTextGroup: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  stepSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  stepAction: {
    marginLeft: 'auto',
  },
  softPanel: {
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: glass.hairline,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
  paperPanel: {
    borderColor: 'rgba(234, 220, 182, 0.82)',
    backgroundColor: 'rgba(255, 248, 232, 0.76)',
  },
  greenPanel: {
    borderColor: 'rgba(175, 207, 145, 0.74)',
    backgroundColor: 'rgba(223, 241, 207, 0.74)',
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: glass.hairline,
    borderRadius: radii.round,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
  },
  segment: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
  },
  segmentSelected: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  segmentText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: colors.moss,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(22, 63, 45, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.moss,
  },
  badge: {
    borderRadius: radii.round,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeGreen: {
    backgroundColor: '#e1f2d5',
  },
  badgeBlue: {
    backgroundColor: '#daf0fb',
  },
  badgeYellow: {
    backgroundColor: '#ffe690',
  },
  badgeText: {
    color: colors.canopy,
    fontSize: 11,
    fontWeight: '800',
  },
  codexCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: glass.hairline,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
  entryThumb: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: '#ffffffaa',
  },
  thumbBloom: {
    backgroundColor: colors.bloom,
  },
  thumbLeaf: {
    backgroundColor: colors.mint,
  },
  thumbSky: {
    backgroundColor: colors.sky,
  },
  entryThumbText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
  },
  entryBody: {
    flex: 1,
    gap: 4,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  entryScientific: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  entryMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  cellGlyph: {
    width: 58,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7ca861',
    transform: [{ rotate: '30deg' }],
  },
  cellGlyphSelected: {
    borderColor: colors.pollen,
    borderWidth: 3,
  },
  cellGlyphInner: {
    transform: [{ rotate: '-30deg' }],
  },
  cellGlyphText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '800',
  },
});
