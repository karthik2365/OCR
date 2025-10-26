export interface OCRField {
    [key: string]: string;
  }
  
  export interface OCRResult {
    text: string;
    confidence: number;
    fields: OCRField;
  }
  
  export interface PDFPageResult extends OCRResult {
    page: number;
  }