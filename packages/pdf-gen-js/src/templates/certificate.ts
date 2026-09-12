import { PDFConfig } from '../config';
import { Theme } from '../theme';
import { PDFDoc } from '../types';
import { requireFields, formatDate } from '../utils/validate';

export interface CertificateData {
  title: string;
  recipientName: string;
  achievementText: string;
  issuerName: string;
  issueDate: Date | string;
  certificationNumber?: string;
  borderColor?: string;
  decorativeElements?: boolean;
}

export function renderCertificate(pdf: PDFDoc, config: PDFConfig, data: CertificateData, theme: Theme): void {
  requireFields(data as any, ['title', 'recipientName', 'achievementText', 'issuerName'], 'certificate');

  const pageWidth = pdf.page.width;
  const pageHeight = pdf.page.height;
  const centerX = pageWidth / 2;
  const borderColor = data.borderColor || theme.primary;

  if (data.decorativeElements !== false) {
    pdf.strokeColor(borderColor).lineWidth(3);
    pdf.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();

    pdf.strokeColor(theme.accent).lineWidth(1);
    pdf.rect(42, 42, pageWidth - 84, pageHeight - 84).stroke();

    // Corner flourishes
    const cornerSize = 26;
    const corners: [number, number][] = [
      [42, 42],
      [pageWidth - 42, 42],
      [42, pageHeight - 42],
      [pageWidth - 42, pageHeight - 42]
    ];
    corners.forEach(([cx, cy]) => {
      pdf.circle(cx, cy, 4).fill(theme.accent);
    });
    void cornerSize;
  }

  let y = pageHeight * 0.14;

  pdf.font('Helvetica-Bold').fontSize(30).fillColor(borderColor).text(data.title, 60, y, {
    align: 'center',
    width: pageWidth - 120
  });
  y = pdf.y + 20;

  pdf.font('Helvetica').fontSize(15).fillColor(theme.text).text('This certificate is proudly presented to', 60, y, {
    align: 'center',
    width: pageWidth - 120
  });
  y = pdf.y + 20;

  pdf.font('Helvetica-Bold').fontSize(30).fillColor(theme.primaryDark).text(data.recipientName, 60, y, {
    align: 'center',
    width: pageWidth - 120
  });
  y = pdf.y + 6;

  pdf
    .strokeColor(theme.accent)
    .lineWidth(1.5)
    .moveTo(centerX - 120, y)
    .lineTo(centerX + 120, y)
    .stroke();
  y += 24;

  pdf.font('Helvetica').fontSize(13).fillColor(theme.text).text(data.achievementText, 100, y, {
    align: 'center',
    width: pageWidth - 200
  });

  const bottomY = pageHeight - 150;

  pdf.font('Helvetica').fontSize(11).fillColor(theme.muted);
  pdf.text(`Date: ${formatDate(data.issueDate)}`, 100, bottomY, { width: 220 });
  if (data.certificationNumber) {
    pdf.text(`Certificate No: ${data.certificationNumber}`, 100, pdf.y + 4, { width: 220 });
  }

  pdf.strokeColor(theme.border).lineWidth(1).moveTo(100, bottomY - 10).lineTo(320, bottomY - 10).stroke();
  pdf.strokeColor(theme.border).moveTo(pageWidth - 320, bottomY - 10).lineTo(pageWidth - 100, bottomY - 10).stroke();

  pdf.font('Helvetica-Bold').fontSize(11).fillColor(theme.text).text(data.issuerName, pageWidth - 320, bottomY, {
    width: 220,
    align: 'right'
  });
  pdf.font('Helvetica').fontSize(9).fillColor(theme.muted).text('Authorized Signature', pageWidth - 320, pdf.y + 4, {
    width: 220,
    align: 'right'
  });
}
