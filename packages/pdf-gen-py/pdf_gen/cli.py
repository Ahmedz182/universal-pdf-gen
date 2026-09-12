import sys
import json
import argparse
from .generator import PDFGenerator
from . import Templates

def main():
    parser = argparse.ArgumentParser(
        description='PDF Generator - Generate PDFs from templates',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  pdf-gen invoice output.pdf --config invoice-data.json
  pdf-gen receipt receipt.pdf --config receipt-data.json --page-size A4
  pdf-gen certificate cert.pdf --config cert-data.json --orientation portrait
        '''
    )

    parser.add_argument('template', help='Template to use (invoice, receipt, certificate)')
    parser.add_argument('output', help='Output PDF filename')
    parser.add_argument('--config', required=True, help='JSON file with template data')
    parser.add_argument('--page-size', default='A4', choices=['A4', 'Letter', 'A3', 'A5'],
                        help='Page size (default: A4)')
    parser.add_argument('--orientation', default='portrait', choices=['portrait', 'landscape'],
                        help='Page orientation (default: portrait)')

    args = parser.parse_args()

    try:
        with open(args.config, 'r') as f:
            config_data = json.load(f)

        pdf = PDFGenerator(page_size=args.page_size, orientation=args.orientation)
        Templates.register(pdf)

        pdf.use_template(args.template, config_data)
        pdf.generate(args.output)
        print(f'✓ PDF generated: {args.output}')

    except FileNotFoundError:
        print(f'Error: Config file not found: {args.config}', file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print(f'Error: Invalid JSON in config file: {args.config}', file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f'Error: {str(e)}', file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
