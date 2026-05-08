declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, any>;
    version: string;
    metadata: Record<string, any>;
  }

  function pdfParse(buffer: Buffer): Promise<PDFData>;

  export = pdfParse;
}
