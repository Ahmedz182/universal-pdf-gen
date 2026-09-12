from .generator import PDFGenerator
from .config import PDFConfig, PAGE_SIZES, DEFAULT_CONFIG
from .templates import render_invoice, render_receipt, render_certificate

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
    'PAGE_SIZES',
    'DEFAULT_CONFIG',
    'Templates',
    'render_invoice',
    'render_receipt',
    'render_certificate',
]
