export { PDFGenerator } from './generator';
export type { PDFConfig } from './config';
export { DEFAULT_CONFIG, PAGE_SIZES, resolvePageDimensions } from './config';
export type { Theme } from './theme';
export { DEFAULT_THEME, mergeTheme } from './theme';
export type { TableColumn, TableOptions } from './utils/table';

import { PDFGenerator, TemplateRenderer } from './generator';
import { renderInvoice } from './templates/invoice';
import { renderReceipt } from './templates/receipt';
import { renderCertificate } from './templates/certificate';

export class Templates {
  static readonly INVOICE = 'invoice';
  static readonly RECEIPT = 'receipt';
  static readonly CERTIFICATE = 'certificate';

  static register(generator: PDFGenerator): void {
    generator.registerTemplate('invoice', renderInvoice as TemplateRenderer);
    generator.registerTemplate('receipt', renderReceipt as TemplateRenderer);
    generator.registerTemplate('certificate', renderCertificate as TemplateRenderer);
  }
}

export { renderInvoice, renderReceipt, renderCertificate };
export type { InvoiceData, InvoiceItem } from './templates/invoice';
export type { ReceiptData, ReceiptItem } from './templates/receipt';
export type { CertificateData } from './templates/certificate';
