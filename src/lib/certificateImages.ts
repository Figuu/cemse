/**
 * Base64 encoded logos for certificate generation
 * React-pdf requires images to be either absolute URLs or base64 encoded
 */

import fs from 'fs';
import path from 'path';

// Helper function to convert image to base64
export function getBase64Image(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).substring(1);
    return `data:image/${ext};base64,${base64Image}`;
  } catch (error) {
    console.error(`Error loading image ${imagePath}:`, error);
    return '';
  }
}

// Cache base64 images to avoid re-reading files
let cachedLogos: {
  cemse: string;
  kallpa: string;
  manqa: string;
  childfund: string;
  stc: string;
  logo40: string;
} | null = null;

export function getCertificateLogos() {
  if (cachedLogos) {
    return cachedLogos;
  }

  cachedLogos = {
    cemse: getBase64Image('logos/cemse.png'),
    kallpa: getBase64Image('logos/kallpa.png'),
    manqa: getBase64Image('logos/manqa.png'),
    childfund: getBase64Image('logos/childfund.png'),
    stc: getBase64Image('logos/stc.png'),
    logo40: getBase64Image('logos/40.png'),
  };

  return cachedLogos;
}
