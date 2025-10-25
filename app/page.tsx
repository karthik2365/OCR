// 'use client';

import OCRBulkUpload from "./components/OCRComponentBulk";
import OCRUploader from "./components/OCRComponentBulk";


// import { useState } from 'react';

// export default function Home() {
//   const [file, setFile] = useState<File | null>(null);
//   const [extractedText, setExtractedText] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       setFile(selectedFile);
//       console.log('Selected file:', selectedFile.name, selectedFile.size, selectedFile.type); // Debug
//       setError('');
//     } else {
//       setFile(null);
//       setError('Please select a valid PDF file');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) {
//       setError('No file selected');
//       console.log('No file selected for submission'); // Debug
//       return;
//     }

//     setIsLoading(true);
//     setError('');
//     setExtractedText('');

//     const formData = new FormData();
//     formData.append('pdf', file);
//     console.log('FormData prepared with file:', file.name); // Debug

//     try {
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });
//       console.log('Response status:', response.status); // Debug
//       const data = await response.json();
//       console.log('Response data:', data); // Debug
//       if (data.error) {
//         setError(data.error);
//       } else {
//         setExtractedText(data.text);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err); // Debug
//       setError('Failed to process PDF');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
//       <h1>PDF OCR with Tesseract.js</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="file"
//           accept=".pdf"
//           onChange={handleFileChange}
//           style={{ margin: '10px 0' }}
//         />
//         <button type="submit" disabled={isLoading || !file}>
//           {isLoading ? 'Processing...' : 'Extract Text'}
//         </button>
//       </form>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {extractedText && (
//         <div>
//           <h3>Extracted Text:</h3>
//           <textarea
//             value={extractedText}
//             readOnly
//             style={{ width: '100%', height: '300px', marginTop: '10px' }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }


export default function Home() {
  return (
    <div>
      <OCRUploader/>
      <OCRBulkUpload/>
    </div>
  );
}