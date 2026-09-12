import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from pdf_gen import PDFGenerator, Templates, detect_format
from pdf_gen.config import PAGE_SIZES

FIXTURES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures')


class TestGenerator(unittest.TestCase):
    def _tmp_path(self, name):
        return os.path.join(tempfile.gettempdir(), f'pdf-gen-test-{os.getpid()}-{name}')

    def test_generates_non_trivial_invoice_pdf(self):
        pdf = PDFGenerator(page_size='A4', orientation='portrait')
        Templates.register(pdf)
        pdf.use_template('invoice', {
            'invoice_number': 'T-1',
            'date': '2024-01-01',
            'company_name': 'Acme',
            'client_name': 'Client',
            'items': [{'description': 'Item', 'quantity': 1, 'unit_price': 10}],
            'subtotal': 10,
            'total': 10,
        })

        path = self._tmp_path('invoice.pdf')
        pdf.generate(path)

        self.assertGreater(os.path.getsize(path), 1000)
        os.remove(path)

    def test_missing_required_fields_raises_clear_error(self):
        pdf = PDFGenerator()
        Templates.register(pdf)
        with self.assertRaisesRegex(ValueError, 'Missing required field'):
            pdf.use_template('invoice', {'invoice_number': 'T-2'})

    def test_unregistered_template_raises(self):
        pdf = PDFGenerator()
        with self.assertRaisesRegex(ValueError, 'not found'):
            pdf.use_template('nonexistent', {})

    def test_paginates_long_invoices(self):
        pdf = PDFGenerator()
        Templates.register(pdf)
        items = [
            {'description': f'Item number {i} with a longer description for wrapping', 'quantity': i + 1, 'unit_price': 12.5}
            for i in range(40)
        ]
        pdf.use_template('invoice', {
            'invoice_number': 'T-3',
            'company_name': 'Acme',
            'client_name': 'Client',
            'items': items,
            'subtotal': 1000,
            'total': 1000,
        })

        path = self._tmp_path('big-invoice.pdf')
        pdf.generate(path)

        with open(path, 'rb') as f:
            content = f.read()
        page_count = content.count(b'/Type /Page')
        self.assertGreater(page_count, 1)
        os.remove(path)

    def test_page_sizes_differ(self):
        self.assertNotEqual(PAGE_SIZES['A4'], PAGE_SIZES['Letter'])
        a4 = PDFGenerator(page_size='A4')
        letter = PDFGenerator(page_size='Letter')
        self.assertNotEqual(a4.page_width, letter.page_width)

    def test_detect_format_recognizes_png_jpeg_webp_svg(self):
        self.assertEqual(detect_format(b'\x89PNG\r\n\x1a\n'), 'png')
        self.assertEqual(detect_format(b'\xff\xd8\xff\xe0'), 'jpeg')
        self.assertEqual(detect_format(b'RIFF\x00\x00\x00\x00WEBP'), 'webp')
        self.assertEqual(detect_format(b'<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'svg')

    def test_embeds_logo_png_jpg_webp_svg_into_invoice(self):
        for ext in ('png', 'jpg', 'webp', 'svg'):
            pdf = PDFGenerator()
            Templates.register(pdf)
            pdf.use_template('invoice', {
                'invoice_number': f'LOGO-{ext}',
                'company_name': 'Acme',
                'client_name': 'Client',
                'logo': os.path.join(FIXTURES_DIR, f'logo.{ext}'),
                'items': [{'description': 'Item', 'quantity': 1, 'unit_price': 10}],
                'subtotal': 10,
                'total': 10,
            })

            path = self._tmp_path(f'logo-{ext}.pdf')
            pdf.generate(path)
            self.assertGreater(os.path.getsize(path), 1000, f'expected a non-empty PDF for .{ext} logo')
            os.remove(path)

    def test_supports_fully_custom_templates_via_register_template(self):
        from pdf_gen import Theme

        pdf = PDFGenerator(theme=Theme(primary='#7a2048', accent='#d4af37'))
        received = {}

        def render_business_card(surface, config, data, theme):
            received['theme'] = theme
            surface.rect(50, 50, 300, 150, fill=theme.primary, radius=10)
            surface.text(70, 80, data['name'], font='Helvetica-Bold', size=18, color=theme.accent)

        pdf.register_template('business_card', render_business_card)
        pdf.use_template('business_card', {'name': 'Jane Doe'})

        self.assertEqual(received['theme'].primary, '#7a2048', 'custom theme should reach the custom template')

        path = self._tmp_path('custom-template.pdf')
        pdf.generate(path)
        self.assertGreater(os.path.getsize(path), 500, 'expected a non-empty PDF from a fully custom template')
        os.remove(path)


if __name__ == '__main__':
    unittest.main()
