#!/usr/bin/env node

const fs = require('fs');
const { PDFGenerator, Templates } = require('../dist/index');

const args = process.argv.slice(2);

function flag(name) {
  const idx = args.indexOf(name);
  return idx === -1 ? null : args[idx + 1];
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
PDF Generator CLI

Usage: pdf-gen <template> <output> [options]

Templates:
  invoice   - Generate an invoice PDF
  receipt   - Generate a receipt PDF
  certificate - Generate a certificate PDF

Options:
  --config <file>        JSON file with template data
  --page-size <size>     Page size: A4 (default), Letter, A3, A5
  --orientation <o>      portrait (default) or landscape
  --logo <file>          Logo image to embed (png, jpg, webp, or svg) —
                         overrides/sets the "logo" field from --config
  --help, -h             Show this help message

Examples:
  pdf-gen invoice invoice.pdf --config invoice-data.json
  pdf-gen invoice invoice.pdf --config invoice-data.json --logo logo.svg
  pdf-gen certificate cert.pdf --config cert-data.json --page-size A4
  `);
  process.exit(0);
}

const template = args[0];
const output = args[1];
const configFile = flag('--config');
const pageSize = flag('--page-size') || 'A4';
const orientation = flag('--orientation') || 'portrait';
const logoFile = flag('--logo');

if (!template || !output) {
  console.error('Error: template and output arguments are required');
  process.exit(1);
}

if (!configFile) {
  console.error('Error: --config file is required');
  process.exit(1);
}

async function main() {
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  if (logoFile) {
    config.logo = logoFile;
  }

  const pdf = new PDFGenerator({ pageSize, orientation });
  Templates.register(pdf);

  await pdf.useTemplate(template, config);
  await pdf.generate(output);
  console.log(`✓ PDF generated: ${output}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
