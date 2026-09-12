const { PDFGenerator, Templates, renderInvoice } = require('../packages/pdf-gen-js/dist/index');

async function generateInvoice() {
  const pdf = new PDFGenerator({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  Templates.register(pdf);

  await pdf.useTemplate('invoice', {
    invoiceNumber: 'INV-2024-001',
    date: new Date('2024-01-15'),
    logo: 'examples/assets/logo.svg',
    companyName: 'ACME Corporation',
    companyAddress: '123 Business Ave, New York, NY 10001',
    clientName: 'John Doe',
    clientAddress: '456 Customer Street, Los Angeles, CA 90001',
    items: [
      {
        description: 'Web Development Services',
        quantity: 1,
        unitPrice: 5000
      },
      {
        description: 'UI/UX Design',
        quantity: 1,
        unitPrice: 2000
      },
      {
        description: 'Project Management',
        quantity: 40,
        unitPrice: 75
      }
    ],
    subtotal: 8000,
    tax: 640,
    total: 8640,
    notes: 'Thank you for your business!',
    paymentTerms: 'Net 30'
  });

  await pdf.generate('examples/invoice-output.pdf');
  console.log('✓ Invoice generated: examples/invoice-output.pdf');
}

async function generateReceipt() {
  const pdf = new PDFGenerator({
    pageSize: 'A4',
    orientation: 'portrait'
  });

  Templates.register(pdf);

  await pdf.useTemplate('receipt', {
    storeName: 'Coffee Shop',
    logo: 'examples/assets/logo.png',
    storeAddress: '123 Main Street, Downtown',
    receiptNumber: 'RCP-2024-001',
    dateTime: new Date(),
    items: [
      { name: 'Cappuccino', quantity: 2, price: 5.50 },
      { name: 'Croissant', quantity: 1, price: 3.50 },
      { name: 'Sandwich', quantity: 1, price: 8.99 }
    ],
    subtotal: 22.98,
    tax: 1.84,
    total: 24.82,
    paymentMethod: 'Card',
    thankYouMessage: 'Thank you for your purchase!'
  });

  await pdf.generate('examples/receipt-output.pdf');
  console.log('✓ Receipt generated: examples/receipt-output.pdf');
}

async function generateCertificate() {
  const pdf = new PDFGenerator({
    pageSize: 'A4',
    orientation: 'portrait'
  });

  Templates.register(pdf);

  await pdf.useTemplate('certificate', {
    title: 'Certificate of Achievement',
    logo: 'examples/assets/logo.webp',
    recipientName: 'Jane Smith',
    achievementText: 'For successfully completing the Advanced PDF Generation course with excellence and dedication',
    issuerName: 'PDF Academy',
    issueDate: new Date('2024-01-15'),
    certificationNumber: 'CERT-2024-001',
    borderColor: '#1a5f7a'
  });

  await pdf.generate('examples/certificate-output.pdf');
  console.log('✓ Certificate generated: examples/certificate-output.pdf');
}

async function main() {
  try {
    console.log('Generating PDF examples...\n');
    await generateInvoice();
    await generateReceipt();
    await generateCertificate();
    console.log('\nAll PDFs generated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
