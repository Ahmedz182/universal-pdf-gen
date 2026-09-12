declare module 'svg-to-pdfkit' {
  interface SVGtoPDFOptions {
    width?: number;
    height?: number;
    preserveAspectRatio?: string;
    useCSS?: boolean;
    fontCallback?: (family: string, bold: boolean, italic: boolean, fontOptions: unknown) => string;
    colorCallback?: (color: string) => [string, number];
    [key: string]: unknown;
  }

  function SVGtoPDF(doc: PDFKit.PDFDocument, svg: string, x: number, y: number, options?: SVGtoPDFOptions): void;

  export = SVGtoPDF;
}
