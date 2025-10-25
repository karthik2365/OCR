import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import { extractTextFromPDF } from '@/lib/ocr';
import { promises as fs } from 'fs';

interface MulterRequest extends NextRequest {
  file: {
    path: string;
    originalname: string;
    size: number;
    mimetype: string;
  };
}

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(process.cwd(), 'public/uploads'),
    filename: (req, file, cb) => {
      console.log('Multer saving file:', file.originalname); // Debug
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const uploadMiddleware = (req: NextRequest) =>
  new Promise<MulterRequest>((resolve, reject) => {
    upload.single('pdf')(
      req as any,
      {} as any,
      (err: any) => {
        if (err) {
          console.error('Multer error:', err.message, err.code); // Debug
          return reject(err);
        }
        console.log('Multer processed, file:', (req as any).file); // Debug
        resolve(req as MulterRequest);
      }
    );
  });

export async function POST(req: NextRequest) {
  try {
    console.log('Received POST request to /api/upload'); // Debug
    const request = await uploadMiddleware(req);
    const file = (request as MulterRequest).file;
    if (!file) {
      console.error('No file received in request'); // Debug
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Processing file:', file.path, file.mimetype, file.size); // Debug
    const pdfPath = file.path;
    const outputDir = path.join(process.cwd(), 'public/uploads');

    const extractedText = await extractTextFromPDF(pdfPath, outputDir);

    await fs.unlink(pdfPath);
    console.log('Cleaned up file:', pdfPath); // Debug

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error('API Error:', error); // Debug
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}