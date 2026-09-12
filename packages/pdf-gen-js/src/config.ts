import { Theme } from './theme';

export interface PDFConfig {
  pageSize: 'A4' | 'Letter' | 'A3' | 'A5';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number };
  defaultFont?: string;
  fontSize?: number;
  lineHeight?: number;
  theme?: Partial<Theme>;
}

export const DEFAULT_CONFIG: PDFConfig = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 40, bottom: 40, left: 40, right: 40 },
  defaultFont: 'Helvetica',
  fontSize: 12,
  lineHeight: 1.5
};

export const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  A3: [841.89, 1190.55],
  A5: [419.53, 595.28]
};

/** Resolves the final [width, height] in points for a config, accounting for orientation. */
export function resolvePageDimensions(config: PDFConfig): [number, number] {
  const [width, height] = PAGE_SIZES[config.pageSize] || PAGE_SIZES.A4;
  return config.orientation === 'landscape' ? [height, width] : [width, height];
}
