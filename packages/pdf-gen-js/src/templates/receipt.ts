import PDFDocument from 'pdfkit';
import { PDFConfig } from '../config';

export interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  receiptNumber: string;
  dateTime: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total?: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  thankYouMessage?: string;
}

export function renderReceipt(pdf: PDFDocument, config: PDFConfig, data: ReceiptData): void {
  const leftMargin = config.margins.left;
  const topMargin = config.margins.top;
  const pageWidth = pdf.page.width - config.margins.left - config.margins.right;
  const centerX = leftMargin + pageWidth / 2;

  pdf.font('Helvetica-Bold', 16).text(data.storeName, leftMargin, topMargin, { align: 'center', width: pageWidth });
  if (data.storeAddress) {
    pdf.font('Helvetica', 9).text(data.storeAddress, leftMargin, pdf.y, { align: 'center', width: pageWidth });
  }

  pdf.font('Helvetica', 9).text(`Receipt #: ${data.receiptNumber}`, leftMargin, pdf.y + 10);
  pdf.text(`Date/Time: ${data.dateTime.toLocaleString()}`);

  const itemsStartY = pdf.y + 15;
  pdf.moveTo(leftMargin, itemsStartY).lineTo(leftMargin + pageWidth, itemsStartY).stroke();

  pdf.font('Helvetica', 9);
  let yPos = itemsStartY + 10;

  data.items.forEach((item) => {
    const itemTotal = item.total || item.quantity * item.price;
    pdf.text(`${item.name}`, leftMargin, yPos);
    pdf.text(`${item.quantity}x @ $${item.price.toFixed(2)}`, leftMargin + 200, yPos, { width: 100 });
    pdf.text(`$${itemTotal.toFixed(2)}`, leftMargin + pageWidth - 60, yPos, { align: 'right' });
    yPos += 15;
  });

  pdf.moveTo(leftMargin, yPos).lineTo(leftMargin + pageWidth, yPos).stroke();

  yPos += 10;
  pdf.font('Helvetica', 9);
  pdf.text('Subtotal:', leftMargin + pageWidth - 130, yPos);
  pdf.text(`$${data.subtotal.toFixed(2)}`, leftMargin + pageWidth - 60, yPos, { align: 'right' });

  if (data.tax) {
    yPos += 15;
    pdf.text('Tax:', leftMargin + pageWidth - 130, yPos);
    pdf.text(`$${data.tax.toFixed(2)}`, leftMargin + pageWidth - 60, yPos, { align: 'right' });
  }

  yPos += 15;
  pdf.font('Helvetica-Bold', 10);
  pdf.text('Total:', leftMargin + pageWidth - 130, yPos);
  pdf.text(`$${data.total.toFixed(2)}`, leftMargin + pageWidth - 60, yPos, { align: 'right' });

  yPos += 20;
  pdf.font('Helvetica', 8).text(`Payment Method: ${data.paymentMethod}`, leftMargin, yPos);

  if (data.thankYouMessage) {
    yPos += 25;
    pdf.font('Helvetica-Bold', 10).text(data.thankYouMessage, leftMargin, yPos, { align: 'center', width: pageWidth });
  }
}
