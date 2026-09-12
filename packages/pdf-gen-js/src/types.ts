import PDFDocumentImport from 'pdfkit';

/** Instance type for a PDFKit document — the community typings expose it as an
 *  interface rather than a proper class, so `new` needs an explicit cast. */
export type PDFDoc = PDFKit.PDFDocument;

type PDFDocumentConstructor = new (options?: PDFKit.PDFDocumentOptions) => PDFKit.PDFDocument;

export const PDFDocumentCtor = PDFDocumentImport as unknown as PDFDocumentConstructor;
