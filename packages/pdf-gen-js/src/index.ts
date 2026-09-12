export { PDFGenerator } from './generator';
export type { PDFConfig } from './config';
export { DEFAULT_CONFIG, PAGE_SIZES } from './config';

import { PDFGenerator, TemplateRenderer, TemplateData } from './generator';
import { renderInvoice, InvoiceData } from './templates/invoice';
import { renderReceipt, ReceiptData } from './templates/receipt';
import { renderCertificate, CertificateData } from './templates/certificate';

export class Templates {
  static register(generator: PDFGenerator): void {
    generator.registerTemplate('invoice', renderInvoice as TemplateRenderer);
    generator.registerTemplate('receipt', renderReceipt as TemplateRenderer);
    generator.registerTemplate('certificate', renderCertificate as TemplateRenderer);
  }
}

export { renderInvoice, InvoiceData, renderReceipt, ReceiptData, renderCertificate, CertificateData };
