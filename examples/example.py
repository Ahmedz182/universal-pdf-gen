#!/usr/bin/env python3

import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'packages', 'pdf-gen-py'))

from pdf_gen import PDFGenerator, Templates
from datetime import datetime

def generate_invoice():
    pdf = PDFGenerator(
        page_size='A4',
        orientation='portrait'
    )

    Templates.register(pdf)

    pdf.use_template('invoice', {
        'invoice_number': 'INV-2024-001',
        'date': '2024-01-15',
        'company_name': 'ACME Corporation',
        'company_address': '123 Business Ave, New York, NY 10001',
        'client_name': 'John Doe',
        'client_address': '456 Customer Street, Los Angeles, CA 90001',
        'items': [
            {
                'description': 'Web Development Services',
                'quantity': 1,
                'unit_price': 5000
            },
            {
                'description': 'UI/UX Design',
                'quantity': 1,
                'unit_price': 2000
            },
            {
                'description': 'Project Management',
                'quantity': 40,
                'unit_price': 75
            }
        ],
        'subtotal': 8000,
        'tax': 640,
        'total': 8640,
        'notes': 'Thank you for your business!',
        'payment_terms': 'Net 30'
    })

    pdf.generate('examples/invoice-output-py.pdf')
    print('✓ Invoice generated: examples/invoice-output-py.pdf')

def generate_receipt():
    pdf = PDFGenerator(
        page_size='A4',
        orientation='portrait'
    )

    Templates.register(pdf)

    pdf.use_template('receipt', {
        'store_name': 'Coffee Shop',
        'store_address': '123 Main Street, Downtown',
        'receipt_number': 'RCP-2024-001',
        'datetime': datetime.now().strftime('%Y-%m-%d %H:%M %p'),
        'items': [
            {'name': 'Cappuccino', 'quantity': 2, 'price': 5.50},
            {'name': 'Croissant', 'quantity': 1, 'price': 3.50},
            {'name': 'Sandwich', 'quantity': 1, 'price': 8.99}
        ],
        'subtotal': 22.98,
        'tax': 1.84,
        'total': 24.82,
        'payment_method': 'Card',
        'thank_you_message': 'Thank you for your purchase!'
    })

    pdf.generate('examples/receipt-output-py.pdf')
    print('✓ Receipt generated: examples/receipt-output-py.pdf')

def generate_certificate():
    pdf = PDFGenerator(
        page_size='A4',
        orientation='portrait'
    )

    Templates.register(pdf)

    pdf.use_template('certificate', {
        'title': 'Certificate of Achievement',
        'recipient_name': 'Jane Smith',
        'achievement_text': 'For successfully completing the Advanced PDF Generation course with excellence and dedication',
        'issuer_name': 'PDF Academy',
        'issue_date': '2024-01-15',
        'certification_number': 'CERT-2024-001',
        'border_color': '#1a5f7a'
    })

    pdf.generate('examples/certificate-output-py.pdf')
    print('✓ Certificate generated: examples/certificate-output-py.pdf')

if __name__ == '__main__':
    try:
        print('Generating PDF examples...\n')
        generate_invoice()
        generate_receipt()
        generate_certificate()
        print('\nAll PDFs generated successfully!')
    except Exception as e:
        print(f'Error: {str(e)}', file=sys.stderr)
        sys.exit(1)
