import PDFDocument from 'pdfkit';
import { PDFConfig } from '../config';

export interface CertificateData {
  title: string;
  recipientName: string;
  achievementText: string;
  issuerName: string;
  issueDate: Date;
  certificationNumber?: string;
  borderColor?: string;
  decorativeElements?: boolean;
}

export function renderCertificate(pdf: PDFDocument, config: PDFConfig, data: CertificateData): void {
  const pageWidth = pdf.page.width;
  const pageHeight = pdf.page.height;
  const centerX = pageWidth / 2;
  const borderColor = data.borderColor || '#1a5f7a';

  // Decorative border
  if (data.decorativeElements !== false) {
    pdf.strokeColor(borderColor).lineWidth(2);
    pdf.rect(40, 40, pageWidth - 80, pageHeight - 80).stroke();

    pdf.lineWidth(1);
    pdf.rect(60, 60, pageWidth - 120, pageHeight - 120).stroke();
  }

  // Title
  pdf.font('Helvetica-Bold', 32)
    .fillColor(borderColor)
    .text(data.title, 0, 100, { align: 'center', width: pageWidth });

  // This certifies
  pdf.fillColor('#000000').font('Helvetica', 16).text('This is to certify that', 0, 180, {
    align: 'center',
    width: pageWidth
  });

  // Recipient name
  pdf.font('Helvetica-Bold', 28)
    .fillColor(borderColor)
    .text(data.recipientName, 0, 230, { align: 'center', width: pageWidth });

  // Achievement text
  pdf.fillColor('#000000')
    .font('Helvetica', 13)
    .text(data.achievementText, 100, 300, { align: 'center', width: pageWidth - 200 });

  // Date and issuer
  const bottomSectionY = pageHeight - 180;
  pdf.font('Helvetica', 11);
  pdf.text(`Date: ${data.issueDate.toLocaleDateString()}`, 100, bottomSectionY);

  if (data.certificationNumber) {
    pdf.text(`Certificate #: ${data.certificationNumber}`, 100, bottomSectionY + 30);
  }

  // Signature line
  pdf.moveTo(100, bottomSectionY + 80).lineTo(250, bottomSectionY + 80).stroke();
  pdf.font('Helvetica', 10).text('Authorized Signature', 100, bottomSectionY + 85);

  // Issuer
  pdf.moveTo(pageWidth - 250, bottomSectionY + 80).lineTo(pageWidth - 100, bottomSectionY + 80).stroke();
  pdf.text(data.issuerName, pageWidth - 250, bottomSectionY + 85, { width: 150 });
}
