import { PDFConfig } from '../config';
import { Theme } from '../theme';
import { PDFDoc } from '../types';
import { drawTable } from '../utils/table';
import { requireFields, toDate, formatDate, formatCurrency } from '../utils/validate';
import { embedImage, LogoInput, resolveLogo } from '../utils/logo';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: Date | string;
  dueDate?: Date | string;
  logo?: LogoInput;
  companyName: string;
  companyAddress?: string;
  clientName: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  taxRate?: number;
  total: number;
  currency?: string;
  notes?: string;
  paymentTerms?: string;
  status?: 'PAID' | 'DUE' | 'OVERDUE';
}

export async function renderInvoice(pdf: PDFDoc, config: PDFConfig, data: InvoiceData, theme: Theme): Promise<void> {
  requireFields(data as any, ['invoiceNumber', 'companyName', 'clientName', 'items', 'subtotal', 'total'], 'invoice');

  const left = config.margins.left;
  const right = pdf.page.width - config.margins.right;
  const contentWidth = right - left;
  const currency = data.currency || 'USD';

  // --- Header banner -------------------------------------------------
  const bannerHeight = 90;
  pdf.rect(0, 0, pdf.page.width, bannerHeight).fill(theme.primary);

  let textLeft = left;
  const logo = resolveLogo(data.logo, 50);
  if (logo) {
    const plate = logo.height + 10;
    pdf.roundedRect(left, (bannerHeight - plate) / 2, plate, plate, 6).fill('#ffffff');
    await embedImage(pdf, logo.src, left + 5, (bannerHeight - plate) / 2 + 5, { width: logo.width, height: logo.height });
    textLeft = left + plate + 15;
  }

  pdf.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26).text('INVOICE', textLeft, 30);
  pdf
    .font('Helvetica')
    .fontSize(10)
    .text(data.companyName, textLeft, 62, { width: contentWidth * 0.6 - (textLeft - left) });

  pdf.font('Helvetica-Bold').fontSize(12).text(`#${data.invoiceNumber}`, left, 30, {
    width: contentWidth,
    align: 'right'
  });
  pdf.font('Helvetica').fontSize(10).text(formatDate(data.date), left, 50, { width: contentWidth, align: 'right' });

  if (data.status) {
    const statusColors: Record<string, string> = { PAID: '#1e8e3e', DUE: theme.accent, OVERDUE: '#c62828' };
    pdf
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(statusColors[data.status] || theme.accent)
      .text(data.status, left, 68, { width: contentWidth, align: 'right' });
  }

  // --- From / Bill To --------------------------------------------------
  let y = bannerHeight + 30;
  pdf.fillColor(theme.muted).font('Helvetica-Bold').fontSize(9).text('FROM', left, y);
  pdf.fillColor(theme.muted).font('Helvetica-Bold').fontSize(9).text('BILL TO', left + contentWidth / 2, y);

  y += 14;
  pdf.fillColor(theme.text).font('Helvetica-Bold').fontSize(11).text(data.companyName, left, y, { width: contentWidth / 2 - 10 });
  pdf.fillColor(theme.text).font('Helvetica-Bold').fontSize(11).text(data.clientName, left + contentWidth / 2, y, {
    width: contentWidth / 2
  });

  y += 16;
  pdf.font('Helvetica').fontSize(10).fillColor(theme.muted);
  if (data.companyAddress) pdf.text(data.companyAddress, left, y, { width: contentWidth / 2 - 10 });
  if (data.clientAddress) pdf.text(data.clientAddress, left + contentWidth / 2, y, { width: contentWidth / 2 });

  if (data.dueDate) {
    y = Math.max(pdf.y, y) + 10;
    pdf.font('Helvetica-Bold').fontSize(9).fillColor(theme.muted).text(`Due date: ${formatDate(data.dueDate)}`, left, y);
  }

  // --- Line items table --------------------------------------------------
  const tableTop = Math.max(pdf.y, y) + 25;
  pdf.y = tableTop;

  const rows = data.items.map((item) => {
    const itemTotal = item.total ?? item.quantity * item.unitPrice;
    return {
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: formatCurrency(item.unitPrice, currency),
      total: formatCurrency(itemTotal, currency)
    };
  });

  const finalY = drawTable(
    pdf,
    config,
    theme,
    [
      { header: 'Description', key: 'description' },
      { header: 'Qty', key: 'quantity', width: contentWidth * 0.12, align: 'right' },
      { header: 'Unit Price', key: 'unitPrice', width: contentWidth * 0.2, align: 'right' },
      { header: 'Total', key: 'total', width: contentWidth * 0.2, align: 'right' }
    ],
    rows,
    { startY: tableTop }
  );

  // --- Totals summary --------------------------------------------------
  const summaryWidth = 220;
  const summaryX = right - summaryWidth;
  let sy = finalY + 15;

  pdf.font('Helvetica').fontSize(10).fillColor(theme.text);
  pdf.text('Subtotal', summaryX, sy, { width: summaryWidth - 90 });
  pdf.text(formatCurrency(data.subtotal, currency), summaryX + summaryWidth - 90, sy, { width: 90, align: 'right' });
  sy += 18;

  if (data.tax || data.taxRate) {
    const taxLabel = data.taxRate ? `Tax (${data.taxRate}%)` : 'Tax';
    pdf.text(taxLabel, summaryX, sy, { width: summaryWidth - 90 });
    pdf.text(formatCurrency(data.tax || 0, currency), summaryX + summaryWidth - 90, sy, { width: 90, align: 'right' });
    sy += 18;
  }

  pdf.moveTo(summaryX, sy).lineTo(summaryX + summaryWidth, sy).strokeColor(theme.border).stroke();
  sy += 8;

  pdf.rect(summaryX, sy, summaryWidth, 30).fill(theme.primary);
  pdf.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12);
  pdf.text('Total', summaryX + 10, sy + 8, { width: summaryWidth - 100 });
  pdf.text(formatCurrency(data.total, currency), summaryX + summaryWidth - 100, sy + 8, { width: 90, align: 'right' });

  // --- Notes & payment terms --------------------------------------------------
  if (data.notes || data.paymentTerms) {
    let ny = sy + 55;
    if (ny + 60 > pdf.page.height - config.margins.bottom) {
      pdf.addPage();
      ny = config.margins.top;
    }
    pdf.fillColor(theme.muted).font('Helvetica-Bold').fontSize(9).text('NOTES', left, ny);
    ny += 14;
    pdf.font('Helvetica').fontSize(10).fillColor(theme.text);
    if (data.notes) pdf.text(data.notes, left, ny, { width: contentWidth });
    if (data.paymentTerms) pdf.text(`Payment terms: ${data.paymentTerms}`, left, pdf.y + 4, { width: contentWidth });
  }
}
