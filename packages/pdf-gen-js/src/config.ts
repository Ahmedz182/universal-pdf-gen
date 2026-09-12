export interface PDFConfig {
  pageSize: 'A4' | 'Letter' | 'A3' | 'A5';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number };
  defaultFont?: string;
  fontSize?: number;
  lineHeight?: number;
}

export const DEFAULT_CONFIG: PDFConfig = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, bottom: 20, left: 20, right: 20 },
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
