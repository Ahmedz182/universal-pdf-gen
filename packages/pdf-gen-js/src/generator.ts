import fs from 'fs';
import { PDFConfig, DEFAULT_CONFIG, resolvePageDimensions } from './config';
import { Theme, mergeTheme } from './theme';
import { PDFDoc, PDFDocumentCtor } from './types';
import { drawTable, TableColumn, TableOptions } from './utils/table';
import { embedImage } from './utils/image';

export interface TemplateData {
  [key: string]: any;
}

export type TemplateRenderer = (
  pdf: PDFDoc,
  config: PDFConfig,
  data: TemplateData,
  theme: Theme
) => void | Promise<void>;

export type { TableColumn, TableOptions };

export class PDFGenerator {
  private doc: PDFDoc;
  private config: PDFConfig;
  private theme: Theme;
  private templates: Map<string, TemplateRenderer> = new Map();

  constructor(config: Partial<PDFConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config, margins: { ...DEFAULT_CONFIG.margins, ...config.margins } };
    this.theme = mergeTheme(this.config.theme);

    const [width, height] = resolvePageDimensions(this.config);

    this.doc = new PDFDocumentCtor({
      size: [width, height],
      margins: this.config.margins,
      bufferPages: true,
      info: { Producer: 'universal-pdf-gen', Creator: 'universal-pdf-gen' }
    });
  }

  registerTemplate(name: string, renderer: TemplateRenderer): void {
    this.templates.set(name, renderer);
  }

  async useTemplate(templateName: string, data: TemplateData): Promise<this> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(
        `Template "${templateName}" not found. Available: ${Array.from(this.templates.keys()).join(', ') || '(none registered)'}`
      );
    }
    await template(this.doc, this.config, data, this.theme);
    return this;
  }

  /** Usable content width between the left and right margins. */
  get contentWidth(): number {
    return this.doc.page.width - this.config.margins.left - this.config.margins.right;
  }

  get contentHeight(): number {
    return this.doc.page.height - this.config.margins.top - this.config.margins.bottom;
  }

  addText(text: string, options: any = {}): this {
    this.doc.text(text, options);
    return this;
  }

  /** Embeds PNG, JPEG, GIF, WEBP, or SVG (file path or Buffer) at the given top-left position. */
  async addImage(source: string | Buffer, x: number, y: number, width?: number, height?: number): Promise<this> {
    await embedImage(this.doc, source, x, y, { width, height });
    return this;
  }

  /**
   * Renders a table with word-wrapped cells, an optional striped body, and automatic
   * page breaks when the table would run past the bottom margin.
   */
  addTable(columns: TableColumn[], rows: Array<Record<string, any> | any[]>, options: TableOptions = {}): this {
    drawTable(this.doc, this.config, this.theme, columns, rows, options);
    return this;
  }

  /** Adds a new page if the given height would not fit before the bottom margin. */
  ensureSpace(height: number): this {
    if (this.doc.y + height > this.doc.page.height - this.config.margins.bottom) {
      this.doc.addPage();
    }
    return this;
  }

  addPage(): this {
    this.doc.addPage();
    return this;
  }

  addLine(x1: number, y1: number, x2: number, y2: number, color: string = this.theme.border, width = 1): this {
    this.doc.strokeColor(color).lineWidth(width).moveTo(x1, y1).lineTo(x2, y2).stroke();
    return this;
  }

  addRect(x: number, y: number, width: number, height: number, fillColor?: string, radius = 0): this {
    if (radius > 0) {
      this.doc.roundedRect(x, y, width, height, radius);
    } else {
      this.doc.rect(x, y, width, height);
    }
    if (fillColor) {
      this.doc.fill(fillColor);
    } else {
      this.doc.stroke();
    }
    return this;
  }

  setFont(fontName: string, size: number): this {
    this.doc.font(fontName).fontSize(size);
    return this;
  }

  moveDown(amount: number = 1): this {
    this.doc.moveDown(amount);
    return this;
  }

  /** Stamps "Page N of M" at the bottom-right of every page. Call once, right before generate(). */
  addPageNumbers(): this {
    const { doc, theme, config } = this;
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const pageNum = i - range.start + 1;
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(theme.muted)
        .text(`Page ${pageNum} of ${range.count}`, 0, doc.page.height - config.margins.bottom + 10, {
          width: doc.page.width,
          align: 'center'
        });
    }
    return this;
  }

  async generate(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filename);
      this.doc.pipe(stream);
      this.doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });
  }

  /** Resolves with the raw PDF bytes instead of writing to disk — useful for HTTP responses. */
  async generateBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);
      this.doc.end();
    });
  }

  getDocument(): PDFDoc {
    return this.doc;
  }

  getTheme(): Theme {
    return this.theme;
  }
}
