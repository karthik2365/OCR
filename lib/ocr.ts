import { fromPath } from 'pdf2pic';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';

export async function extractTextFromPDF(pdfPath: string, outputDir: string): Promise<string> {
  try {
    console.log('Starting PDF processing, input:', pdfPath, 'outputDir:', outputDir); // Debug
    await fs.mkdir(outputDir, { recursive: true });
    const output = fromPath(pdfPath, {
      density: 300,
      format: 'png',
      outputDir,
      outputName: 'page',
    });

    await output.bulk(-1);
    console.log('PDF converted to images in:', outputDir); // Debug
    const files = await fs.readdir(outputDir);
    const imageFiles = files.filter((file) => file.endsWith('.png')).sort();
    console.log('Generated images:', imageFiles); // Debug

    let extractedText = '';
    for (const file of imageFiles) {
      const imagePath = path.join(outputDir, file);
      console.log('Processing image:', imagePath); // Debug
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: (m: any) => console.log('Tesseract progress:', m),
      });
      extractedText += text + '\n\n--- Page Separator ---\n\n';
      await fs.unlink(imagePath);
      console.log('Deleted image:', imagePath); // Debug
    }

    return extractedText;
  } catch (error) {
    console.error('OCR Error:', error); // Debug
    throw new Error('Failed to process PDF');
  }
}