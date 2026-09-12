from .generator import PDFGenerator
from .config import PDFConfig, Theme, PAGE_SIZES, DEFAULT_CONFIG
from .templates.invoice import render_invoice
from .templates.receipt import render_receipt
from .templates.certificate import render_certificate


class Templates:
    INVOICE = 'invoice'
    RECEIPT = 'receipt'
    CERTIFICATE = 'certificate'

    @staticmethod
    def register(generator: PDFGenerator) -> None:
        generator.register_template('invoice', render_invoice)
        generator.register_template('receipt', render_receipt)
        generator.register_template('certificate', render_certificate)


__all__ = [
    'PDFGenerator',
    'PDFConfig',
    'Theme',
    'PAGE_SIZES',
    'DEFAULT_CONFIG',
    'Templates',
    'render_invoice',
    'render_receipt',
    'render_certificate',
]
