export const bookkFonts = {
  light: 'BookkGothic-Light',
  bold: 'BookkGothic-Bold',
} as const;

export const fontWeights = {
  light: {
    fontFamily: bookkFonts.light,
    fontWeight: '400' as const,
  },
  bold: {
    fontFamily: bookkFonts.bold,
    fontWeight: '700' as const,
  },
};
