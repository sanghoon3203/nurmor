export const colors = {
  canopy: '#163f2d',
  pine: '#245936',
  moss: '#4c7a3f',
  leaf: '#6daf45',
  sprout: '#b9e37f',
  mint: '#dff1cf',
  bloom: '#ffcf5a',
  pollen: '#f6b83f',
  clay: '#d86f45',
  ink: '#172219',
  text: '#253225',
  muted: '#61715f',
  line: '#d5e5d1',
  warmLine: '#eadcb6',
  paper: '#fffdf4',
  parchment: '#fbf1d9',
  field: '#f6fbf4',
  cream: '#fff8e8',
  water: '#d9f0ef',
  sky: '#cdeef5',
  aiBlue: '#87cff0',
  danger: '#a33b2f',
  white: '#ffffff',
  shadow: '#172219',
} as const;

export const glass = {
  surface: 'rgba(255, 255, 255, 0.7)',
  surfaceStrong: 'rgba(255, 255, 255, 0.86)',
  surfaceChrome: 'rgba(255, 255, 255, 0.78)',
  border: 'rgba(255, 255, 255, 0.76)',
  hairline: 'rgba(22, 63, 45, 0.1)',
  shadow: 'rgba(22, 63, 45, 0.16)',
  tintGreen: 'rgba(223, 241, 207, 0.7)',
  tintSky: 'rgba(205, 238, 245, 0.68)',
  tintBloom: 'rgba(255, 207, 90, 0.22)',
} as const;

export const motion = {
  panelMs: 380,
  tabMs: 320,
} as const;

export const bloomColors: Record<string, string> = {
  UNOBSERVED: '#cbd8c5',
  VISITED: '#9fd1bf',
  SEEDED: '#b9e37f',
  GROWING: '#61a15a',
  BLOOMED: '#ffcf5a',
};

export const radii = {
  small: 6,
  medium: 8,
  large: 18,
  sheet: 28,
  round: 999,
} as const;
