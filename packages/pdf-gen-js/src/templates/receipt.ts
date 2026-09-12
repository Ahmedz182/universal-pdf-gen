import { PDFConfig } from '../config';
import { Theme } from '../theme';
import { PDFDoc } from '../types';
import { requireFields, toDate, formatCurrency } from '../utils/validate';
import { embedImage, LogoInput, resolveLogo } from '../utils/logo';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  logo?: LogoInput;
  receiptNumber: string;
  dateTime: Date | string;
  items: ReceiptItem[];
  subtotal: number;
  tax?: number;
  total: number;
  currency?: string;
  paymentMethod: string;
  thankYouMessage?: string;
}

export async function renderReceipt(pdf: PDFDoc, config: PDFConfig, data: ReceiptData, theme: Theme): Promise<void> {
  requireFields(data as any, ['storeName', 'receiptNumber', 'items', 'subtotal', 'total', 'paymentMethod'], 'receipt');

  const left = config.margins.left;
  const right = pdf.page.width - config.margins.right;
  const width = right - left;
  const centerX = left + width / 2;
  const currency = data.currency || 'USD';
  const dateTime = toDate(data.dateTime);

  let y = config.margins.top;

  const logo = resolveLogo(data.logo, 44);
  if (logo) {
    await embedImage(pdf, logo.src, centerX - logo.width / 2, y, { width: logo.width, height: logo.height });
    y += logo.height + 8;
  }

  pdf.fillColor(theme.primary).font('Helvetica-Bold').fontSize(18).text(data.storeName, left, y, {
    align: 'center',
    width
  });
  y = pdf.y + 2;

  if (data.storeAddress) {
    pdf.fillColor(theme.muted).font('Helvetica').fontSize(9).text(data.storeAddress, left, y, { align: 'center', width });
    y = pdf.y;
  }

  y += 12;
  pdf
    .strokeColor(theme.border)
    .lineWidth(1)
    .moveTo(left, y)
    .lineTo(right, y)
    .stroke();
  y += 12;

  pdf.fillColor(theme.text).font('Helvetica').fontSize(9);
  pdf.text(`Receipt #: ${data.receiptNumber}`, left, y);
  pdf.text(
    dateTime.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    left,
    pdf.y + 2
  );
  y = pdf.y + 14;

  pdf.strokeColor(theme.border).dash(2, { space: 2 }).moveTo(left, y).lineTo(right, y).stroke();
  pdf.undash();
  y += 10;

  pdf.font('Helvetica-Bold').fontSize(9).fillColor(theme.muted);
  pdf.text('ITEM', left, y, { width: width * 0.5 });
  pdf.text('QTY x PRICE', left + width * 0.5, y, { width: width * 0.3, align: 'right' });
  pdf.text('TOTAL', left + width * 0.8, y, { width: width * 0.2, align: 'right' });
  y += 14;

  pdf.font('Helvetica').fontSize(10).fillColor(theme.text);
  data.items.forEach((item) => {
    const itemTotal = item.total ?? item.quantity * item.price;

    if (y + 16 > pdf.page.height - config.margins.bottom) {
      pdf.addPage();
      y = config.margins.top;
    }

    pdf.text(item.name, left, y, { width: width * 0.5 });
    pdf.text(`${item.quantity} x ${formatCurrency(item.price, currency)}`, left + width * 0.5, y, {
      width: width * 0.3,
      align: 'right'
    });
    pdf.text(formatCurrency(itemTotal, currency), left + width * 0.8, y, { width: width * 0.2, align: 'right' });
    y += 16;
  });

  y += 4;
  pdf.strokeColor(theme.border).moveTo(left, y).lineTo(right, y).stroke();
  y += 10;

  const labelWidth = width - 90;
  pdf.font('Helvetica').fontSize(10).fillColor(theme.text);
  pdf.text('Subtotal', left, y, { width: labelWidth });
  pdf.text(formatCurrency(data.subtotal, currency), left + labelWidth, y, { width: 90, align: 'right' });
  y += 16;

  if (data.tax) {
    pdf.text('Tax', left, y, { width: labelWidth });
    pdf.text(formatCurrency(data.tax, currency), left + labelWidth, y, { width: 90, align: 'right' });
    y += 16;
  }

  pdf.font('Helvetica-Bold').fontSize(13).fillColor(theme.primary);
  pdf.text('TOTAL', left, y, { width: labelWidth });
  pdf.text(formatCurrency(data.total, currency), left + labelWidth, y, { width: 90, align: 'right' });
  y += 24;

  pdf.font('Helvetica').fontSize(9).fillColor(theme.muted).text(`Payment method: ${data.paymentMethod}`, left, y, {
    align: 'center',
    width
  });
  y = pdf.y + 14;

  if (data.thankYouMessage) {
    pdf.font('Helvetica-BoldOblique').fontSize(11).fillColor(theme.primary).text(data.thankYouMessage, left, y, {
      align: 'center',
      width
    });
  }
}
