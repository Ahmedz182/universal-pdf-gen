const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PDFGenerator, Templates } = require('../dist/index');

function tmpFile(name) {
  return path.join(os.tmpdir(), `pdf-gen-test-${Date.now()}-${name}`);
}

test('generates a non-trivial invoice PDF', async () => {
  const pdf = new PDFGenerator({ pageSize: 'A4', orientation: 'portrait' });
  Templates.register(pdf);
  await pdf.useTemplate('invoice', {
    invoiceNumber: 'T-1',
    date: '2024-01-01',
    companyName: 'Acme',
    clientName: 'Client',
    items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    subtotal: 10,
    total: 10
  });

  const file = tmpFile('invoice.pdf');
  await pdf.generate(file);

  const stats = fs.statSync(file);
  assert.ok(stats.size > 1000, 'PDF should be a reasonably sized, non-empty file');
  fs.unlinkSync(file);
});

test('throws a clear error when required invoice fields are missing', async () => {
  const pdf = new PDFGenerator();
  Templates.register(pdf);
  await assert.rejects(
    () => pdf.useTemplate('invoice', { invoiceNumber: 'T-2' }),
    /Missing required field/
  );
});

test('throws when using an unregistered template', async () => {
  const pdf = new PDFGenerator();
  await assert.rejects(() => pdf.useTemplate('nonexistent', {}), /not found/);
});

test('paginates long invoices across multiple pages', async () => {
  const pdf = new PDFGenerator();
  Templates.register(pdf);
  const items = Array.from({ length: 40 }, (_, i) => ({
    description: `Item number ${i} with a longer description for wrapping`,
    quantity: i + 1,
    unitPrice: 12.5
  }));
  await pdf.useTemplate('invoice', {
    invoiceNumber: 'T-3',
    companyName: 'Acme',
    clientName: 'Client',
    items,
    subtotal: 1000,
    total: 1000
  });

  const file = tmpFile('big-invoice.pdf');
  await pdf.generate(file);
  const content = fs.readFileSync(file, 'latin1');
  const pageMatches = content.match(/\/Type\s*\/Page[^s]/g) || [];
  assert.ok(pageMatches.length > 1, 'expected more than one page for a long invoice');
  fs.unlinkSync(file);
});

test('respects custom page size (Letter vs A4 produce different dimensions)', () => {
  const a4 = new PDFGenerator({ pageSize: 'A4' });
  const letter = new PDFGenerator({ pageSize: 'Letter' });
  assert.notStrictEqual(a4.getDocument().page.width, letter.getDocument().page.width);
});

test('detectFormat recognizes png, jpeg, webp, and svg from bytes', () => {
  const { detectFormat } = require('../dist/index');
  assert.strictEqual(detectFormat(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0])), 'png');
  assert.strictEqual(detectFormat(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'jpeg');
  assert.strictEqual(detectFormat(Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP')])), 'webp');
  assert.strictEqual(detectFormat(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), 'svg');
});

test('embeds a logo (png, jpg, webp, svg) into an invoice without throwing', async () => {
  const formats = ['png', 'jpg', 'webp', 'svg'];
  for (const ext of formats) {
    const logoPath = path.join(__dirname, 'fixtures', `logo.${ext}`);
    const pdf = new PDFGenerator();
    Templates.register(pdf);
    await pdf.useTemplate('invoice', {
      invoiceNumber: `LOGO-${ext}`,
      companyName: 'Acme',
      clientName: 'Client',
      logo: logoPath,
      items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
      subtotal: 10,
      total: 10
    });

    const file = tmpFile(`logo-${ext}.pdf`);
    await pdf.generate(file);
    assert.ok(fs.statSync(file).size > 1000, `expected a non-empty PDF for .${ext} logo`);
    fs.unlinkSync(file);
  }
});

test('supports fully custom templates via registerTemplate, with full access to theme and raw doc', async () => {
  const pdf = new PDFGenerator({ theme: { primary: '#7a2048', accent: '#d4af37' } });

  let receivedTheme = null;
  pdf.registerTemplate('businessCard', (doc, config, data, theme) => {
    receivedTheme = theme;
    doc.roundedRect(50, 50, 300, 150, 10).fill(theme.primary);
    doc.fillColor(theme.accent).font('Helvetica-Bold').fontSize(18).text(data.name, 70, 80);
  });

  await pdf.useTemplate('businessCard', { name: 'Jane Doe' });

  assert.strictEqual(receivedTheme.primary, '#7a2048', 'custom theme should reach the custom template');

  const file = tmpFile('custom-template.pdf');
  await pdf.generate(file);
  assert.ok(fs.statSync(file).size > 500, 'expected a non-empty PDF from a fully custom template');
  fs.unlinkSync(file);
});
