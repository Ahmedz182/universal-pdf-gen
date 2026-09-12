import { PDFConfig } from '../config';
import { Theme } from '../theme';
import { PDFDoc } from '../types';

export interface TableColumn {
  header: string;
  key?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableOptions {
  rowHeight?: number;
  headerHeight?: number;
  striped?: boolean;
  fontSize?: number;
  startY?: number;
}

/**
 * Draws a table with word-wrapped cells, an optional striped body, and automatic
 * page breaks when a row would run past the bottom margin. Returns the Y position
 * immediately below the finished table.
 */
export function drawTable(
  doc: PDFDoc,
  config: PDFConfig,
  theme: Theme,
  columns: TableColumn[],
  rows: Array<Record<string, any> | any[]>,
  options: TableOptions = {}
): number {
  const x = config.margins.left;
  const totalWidth = doc.page.width - config.margins.left - config.margins.right;
  const headerHeight = options.headerHeight ?? 26;
  const fontSize = options.fontSize ?? 10;
  const striped = options.striped ?? true;

  const explicitWidth = columns.reduce((sum, c) => sum + (c.width || 0), 0);
  const flexColumns = columns.filter((c) => !c.width).length;
  const flexWidth = flexColumns > 0 ? (totalWidth - explicitWidth) / flexColumns : 0;
  const widths = columns.map((c) => c.width || flexWidth);

  const cellValue = (row: Record<string, any> | any[], col: TableColumn, idx: number): string => {
    const raw = Array.isArray(row) ? row[idx] : row[col.key as string];
    return raw === undefined || raw === null ? '' : String(raw);
  };

  const rowLineCount = (row: Record<string, any> | any[]): number => {
    let maxLines = 1;
    columns.forEach((col, i) => {
      const text = cellValue(row, col, i);
      const height = doc.heightOfString(text, { width: widths[i] - 12 });
      const lines = Math.ceil(height / (fontSize * 1.3));
      maxLines = Math.max(maxLines, lines || 1);
    });
    return maxLines;
  };

  const drawHeader = (y: number): number => {
    doc.rect(x, y, totalWidth, headerHeight).fill(theme.tableHeaderBg);
    doc.fillColor(theme.tableHeaderText).font('Helvetica-Bold').fontSize(fontSize);
    let colX = x;
    columns.forEach((col, i) => {
      doc.text(col.header, colX + 6, y + headerHeight / 2 - fontSize / 2, {
        width: widths[i] - 12,
        align: col.align || 'left'
      });
      colX += widths[i];
    });
    return y + headerHeight;
  };

  let y = options.startY ?? doc.y;
  if (y + headerHeight > doc.page.height - config.margins.bottom) {
    doc.addPage();
    y = config.margins.top;
  }
  y = drawHeader(y);

  rows.forEach((row, rowIdx) => {
    const lines = rowLineCount(row);
    const rowHeight = Math.max(options.rowHeight ?? 22, lines * fontSize * 1.3 + 10);

    if (y + rowHeight > doc.page.height - config.margins.bottom) {
      doc.addPage();
      y = drawHeader(config.margins.top);
    }

    if (striped && rowIdx % 2 === 1) {
      doc.rect(x, y, totalWidth, rowHeight).fill(theme.tableStripeBg);
    }

    doc.fillColor(theme.text).font('Helvetica').fontSize(fontSize);
    let colX = x;
    columns.forEach((col, i) => {
      doc.text(cellValue(row, col, i), colX + 6, y + 6, {
        width: widths[i] - 12,
        align: col.align || 'left'
      });
      colX += widths[i];
    });

    doc
      .strokeColor(theme.border)
      .lineWidth(0.5)
      .moveTo(x, y + rowHeight)
      .lineTo(x + totalWidth, y + rowHeight)
      .stroke();

    y += rowHeight;
  });

  doc.x = x;
  doc.y = y;
  return y;
}
