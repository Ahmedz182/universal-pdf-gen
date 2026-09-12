"""
Demonstrates building a FULLY custom PDF design — not one of the built-in
templates (invoice/receipt/certificate). register_template() hands your
renderer the Surface (top-down coordinates), config, and shared theme, so you
have complete control over the layout while still reusing colors, page-size
resolution, and the low-level helpers (add_table, add_image, etc.) if you
want them.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'packages', 'pdf-gen-py'))

from pdf_gen import PDFGenerator, Theme


def render_business_card(surface, config, data, theme):
    card_width = 350
    card_height = 200
    x = (surface.page_width - card_width) / 2
    y_top = (surface.page_height - card_height) / 2

    surface.rect(x, y_top, card_width, card_height, fill=theme.primary, radius=12)
    surface.text(x + 25, y_top + 30, data['name'], font='Helvetica-Bold', size=20, color=theme.accent)
    surface.text(x + 25, y_top + 58, data['title'], font='Helvetica', size=11, color='#ffffff')

    surface.line(x + 25, y_top + 90, x + card_width - 25, y_top + 90, color=theme.accent)

    surface.text(x + 25, y_top + 105, data['email'], font='Helvetica', size=10, color='#ffffff')
    surface.text(x + 25, y_top + 122, data['phone'], font='Helvetica', size=10, color='#ffffff')


def main():
    pdf = PDFGenerator(
        page_size='A4',
        theme=Theme(primary='#7a2048', accent='#d4af37')  # your own brand colors
    )

    pdf.register_template('business_card', render_business_card)
    pdf.use_template('business_card', {
        'name': 'Ahmed Fayyaz',
        'title': 'Software Engineer',
        'email': 'ahmed@example.com',
        'phone': '+1 555 0100'
    })

    pdf.generate('examples/custom-template-output-py.pdf')
    print('✓ Custom template generated: examples/custom-template-output-py.pdf')


if __name__ == '__main__':
    main()
