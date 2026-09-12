/**
 * Demonstrates building a FULLY custom PDF design — not one of the built-in
 * templates (invoice/receipt/certificate). registerTemplate() hands your
 * renderer the raw PDFKit document plus the shared theme and config, so you
 * have complete control over the layout while still reusing colors,
 * page-size resolution, and the low-level helpers (addTable, addImage, etc.)
 * if you want them.
 */
const { PDFGenerator } = require('../packages/pdf-gen-js/dist/index');

async function main() {
  const pdf = new PDFGenerator({
    pageSize: 'A4',
    theme: { primary: '#7a2048', accent: '#d4af37' } // your own brand colors
  });

  pdf.registerTemplate('businessCard', (doc, config, data, theme) => {
    const cardWidth = 350;
    const cardHeight = 200;
    const x = (doc.page.width - cardWidth) / 2;
    const y = (doc.page.height - cardHeight) / 2;

    doc.roundedRect(x, y, cardWidth, cardHeight, 12).fill(theme.primary);
    doc.fillColor(theme.accent).font('Helvetica-Bold').fontSize(20).text(data.name, x + 25, y + 30);
    doc.fillColor('#ffffff').font('Helvetica').fontSize(11).text(data.title, x + 25, y + 58);

    doc
      .moveTo(x + 25, y + 90)
      .lineTo(x + cardWidth - 25, y + 90)
      .strokeColor(theme.accent)
      .stroke();

    doc.fontSize(10).text(data.email, x + 25, y + 105);
    doc.text(data.phone, x + 25, y + 122);
  });

  await pdf.useTemplate('businessCard', {
    name: 'Ahmed Fayyaz',
    title: 'Software Engineer',
    email: 'ahmed@example.com',
    phone: '+1 555 0100'
  });

  await pdf.generate('examples/custom-template-output.pdf');
  console.log('✓ Custom template generated: examples/custom-template-output.pdf');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
