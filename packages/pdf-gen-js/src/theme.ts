export interface Theme {
  primary: string;
  primaryDark: string;
  accent: string;
  text: string;
  muted: string;
  border: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  tableStripeBg: string;
  background: string;
}

export const DEFAULT_THEME: Theme = {
  primary: '#2b5797',
  primaryDark: '#1c3a66',
  accent: '#e8b923',
  text: '#1a1a1a',
  muted: '#6b7280',
  border: '#d9dee4',
  tableHeaderBg: '#2b5797',
  tableHeaderText: '#ffffff',
  tableStripeBg: '#f4f6f9',
  background: '#ffffff'
};

export const FONTS = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  italic: 'Helvetica-Oblique',
  boldItalic: 'Helvetica-BoldOblique'
};

export function mergeTheme(overrides: Partial<Theme> = {}): Theme {
  return { ...DEFAULT_THEME, ...overrides };
}
