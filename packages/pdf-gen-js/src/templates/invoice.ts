import PDFDocument from 'pdfkit';
import { PDFConfig } from '../config';

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  companyName: string;
  companyAddress?: string;
  clientName: string;
  clientAddress?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total?: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

export function renderInvoice(pdf: PDFDocument, config: PDFConfig, data: InvoiceData): void {
  const leftMargin = config.margins.left;
  const topMargin = config.margins.top;
  const pageWidth = pdf.page.width - config.margins.left - config.margins.right;

  pdf.font('Helvetica-Bold', 24).text('INVOICE', leftMargin, topMargin);

  pdf.font('Helvetica', 10).text(`Invoice #: ${data.invoiceNumber}`, leftMargin, topMargin + 40);
  pdf.text(`Date: ${data.date.toLocaleDateString()}`);

  pdf.font('Helvetica-Bold', 12).text('From:', leftMargin, topMargin + 80);
  pdf.font('Helvetica', 11).text(data.companyName);
  if (data.companyAddress) pdf.text(data.companyAddress);

  pdf.font('Helvetica-Bold', 12).text('Bill To:', leftMargin + 300, topMargin + 80);
  pdf.font('Helvetica', 11).text(data.clientName, leftMargin + 300);
  if (data.clientAddress) pdf.text(data.clientAddress, leftMargin + 300);

  const tableTop = topMargin + 160;
  const columns = ['Description', 'Quantity', 'Unit Price', 'Total'];
  const columnWidths = [pageWidth * 0.5, pageWidth * 0.15, pageWidth * 0.15, pageWidth * 0.2];

  pdf.font('Helvetica-Bold', 11);
  let xPos = leftMargin;
  columns.forEach((col, i) => {
    pdf.text(col, xPos, tableTop);
    xPos += columnWidths[i];
  });

  pdf.moveTo(leftMargin, tableTop + 20).lineTo(leftMargin + pageWidth, tableTop + 20).stroke();

  pdf.font('Helvetica', 10);
  let yPos = tableTop + 30;
  data.items.forEach((item) => {
    const itemTotal = item.total || item.quantity * item.unitPrice;
    xPos = leftMargin;
    pdf.text(item.description, xPos, yPos, { width: columnWidths[0] });
    xPos += columnWidths[0];
    pdf.text(item.quantity.toString(), xPos, yPos, { width: columnWidths[1] });
    xPos += columnWidths[1];
    pdf.text(`$${item.unitPrice.toFixed(2)}`, xPos, yPos, { width: columnWidths[2] });
    xPos += columnWidths[2];
    pdf.text(`$${itemTotal.toFixed(2)}`, xPos, yPos, { width: columnWidths[3] });
    yPos += 20;
  });

  const summaryX = leftMargin + pageWidth - 200;
  yPos += 10;
  pdf.moveTo(summaryX - 20, yPos).lineTo(summaryX + 150, yPos).stroke();

  yPos += 10;
  pdf.font('Helvetica', 10);
  pdf.text('Subtotal:', summaryX, yPos);
  pdf.text(`$${data.subtotal.toFixed(2)}`, summaryX + 120, yPos, { align: 'right' });

  if (data.tax) {
    yPos += 20;
    pdf.text('Tax:', summaryX, yPos);
    pdf.text(`$${data.tax.toFixed(2)}`, summaryX + 120, yPos, { align: 'right' });
  }

  yPos += 20;
  pdf.font('Helvetica-Bold', 12);
  pdf.text('Total:', summaryX, yPos);
  pdf.text(`$${data.total.toFixed(2)}`, summaryX + 120, yPos, { align: 'right' });

  if (data.notes || data.paymentTerms) {
    yPos += 50;
    pdf.font('Helvetica-Bold', 11).text('Notes & Terms:', leftMargin, yPos);
    pdf.font('Helvetica', 10).text(data.notes || '');
    if (data.paymentTerms) pdf.text(`Payment Terms: ${data.paymentTerms}`);
  }
}
