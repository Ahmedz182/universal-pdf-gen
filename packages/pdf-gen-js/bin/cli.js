#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { PDFGenerator, Templates } = require('../dist/index');

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
PDF Generator CLI

Usage: pdf-gen <template> <output> [options]

Templates:
  invoice   - Generate an invoice PDF
  receipt   - Generate a receipt PDF
  certificate - Generate a certificate PDF

Options:
  --config <file>  - JSON file with template data
  --page-size <size>  - Page size: A4 (default), Letter, A3, A5
  --orientation <orientation>  - portrait (default) or landscape
  --help, -h  - Show this help message

Examples:
  pdf-gen invoice invoice.pdf --config invoice-data.json
  pdf-gen certificate cert.pdf --config cert-data.json --page-size A4
  `);
  process.exit(0);
}

const template = args[0];
const output = args[1];
const configFile = args.includes('--config') ? args[args.indexOf('--config') + 1] : null;
const pageSize = args.includes('--page-size') ? args[args.indexOf('--page-size') + 1] : 'A4';
const orientation = args.includes('--orientation') ? args[args.indexOf('--orientation') + 1] : 'portrait';

if (!template || !output) {
  console.error('Error: template and output arguments are required');
  process.exit(1);
}

if (!configFile) {
  console.error('Error: --config file is required');
  process.exit(1);
}

try {
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const pdf = new PDFGenerator({ pageSize, orientation });
  Templates.register(pdf);

  pdf.useTemplate(template, config);
  pdf.generate(output).then(() => {
    console.log(`✓ PDF generated: ${output}`);
  });
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
