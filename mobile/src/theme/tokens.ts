export const colors = {
  canopy: '#163f2d',
  moss: '#4c7a3f',
  sprout: '#b9e37f',
  bloom: '#ffcf5a',
  clay: '#d86f45',
  ink: '#172219',
  text: '#253225',
  muted: '#61715f',
  line: '#d5e5d1',
  paper: '#fffdf4',
  field: '#f6fbf4',
  water: '#d9f0ef',
  danger: '#a33b2f',
  white: '#ffffff',
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
  round: 999,
} as const;
