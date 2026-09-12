import PDFDocument from 'pdfkit';
import fs from 'fs';
import { PDFConfig, DEFAULT_CONFIG, PAGE_SIZES } from './config';

export interface TemplateData {
  [key: string]: any;
}

export type TemplateRenderer = (pdf: PDFDocument, config: PDFConfig, data: TemplateData) => void;

export class PDFGenerator {
  private doc: PDFDocument;
  private config: PDFConfig;
  private templates: Map<string, TemplateRenderer>;

  constructor(config: Partial<PDFConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.templates = new Map();

    const [width, height] = PAGE_SIZES[this.config.pageSize];
    const [finalWidth, finalHeight] = this.config.orientation === 'landscape' ? [height, width] : [width, height];

    this.doc = new PDFDocument({
      size: [finalWidth, finalHeight],
      margins: this.config.margins
    });
  }

  registerTemplate(name: string, renderer: TemplateRenderer): void {
    this.templates.set(name, renderer);
  }

  useTemplate(templateName: string, data: TemplateData): void {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template "${templateName}" not found. Available: ${Array.from(this.templates.keys()).join(', ')}`);
    }
    template(this.doc, this.config, data);
  }

  addText(text: string, options: any = {}): this {
    this.doc.text(text, options);
    return this;
  }

  addImage(imagePath: string, x: number, y: number, width: number, height: number): this {
    this.doc.image(imagePath, x, y, { width, height });
    return this;
  }

  addTable(columns: string[], rows: string[][], options: any = {}): this {
    const x = this.doc.x;
    const y = this.doc.y;
    const columnWidth = (this.doc.page.width - this.config.margins.left - this.config.margins.right) / columns.length;
    const rowHeight = options.rowHeight || 30;

    // Header
    this.doc.fillColor('#f0f0f0');
    columns.forEach((col, i) => {
      this.doc.rect(x + i * columnWidth, y, columnWidth, rowHeight).fill();
      this.doc.fillColor('#000000').text(col, x + i * columnWidth + 5, y + 8, { width: columnWidth - 10 });
    });

    // Rows
    rows.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        this.doc.rect(x + colIdx * columnWidth, y + (rowIdx + 1) * rowHeight, columnWidth, rowHeight).stroke();
        this.doc.text(cell, x + colIdx * columnWidth + 5, y + (rowIdx + 1) * rowHeight + 8, { width: columnWidth - 10 });
      });
    });

    this.doc.y = y + (rows.length + 1) * rowHeight;
    return this;
  }

  addPage(): this {
    this.doc.addPage();
    return this;
  }

  addLine(x1: number, y1: number, x2: number, y2: number, color: string = '#000000'): this {
    this.doc.strokeColor(color).moveTo(x1, y1).lineTo(x2, y2).stroke();
    return this;
  }

  setFont(fontName: string, size: number): this {
    this.doc.font(fontName, size);
    return this;
  }

  moveDown(amount: number = 1): this {
    this.doc.moveDown(amount);
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

  getDocument(): PDFDocument {
    return this.doc;
  }
}
