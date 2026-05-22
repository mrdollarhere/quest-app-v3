import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface CertificateData {
  studentName: string;
  testName: string;
  score: number;
  total: number;
  date: Date;
  certificateId: string;
  platformName: string;
}

/**
 * High-Precision Certificate Generation Protocol (v19.5)
 * 
 * Re-engineered to use the Canvas Rendering Protocol.
 * This ensures full Unicode support for Vietnamese diacritics by 
 * leveraging the browser's native text engine before PDF extraction.
 */
export async function generateCertificatePDF(data: CertificateData) {
  // 1. Initialize High-Res Canvas Terminal
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('[Certificate Engine] Failed to initialize 2D context.');
    return;
  }

  // Quality Protocol: Render at 3x scale for professional print density
  const scale = 3;
  const w = 842 * scale; // A4 Landscape points * scale
  const h = 595 * scale; // A4 Landscape points * scale
  canvas.width = w;
  canvas.height = h;

  // 2. Base Layer: Registry Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Color Registry
  const colorNavy = '#1a2340';
  const colorBlue = '#3B5BDB';
  const colorGray = '#94a3b8';

  // 3. Border Protocol (Spatial Margins)
  ctx.strokeStyle = colorNavy;
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(20 * scale, 20 * scale, w - 40 * scale, h - 40 * scale);

  ctx.strokeStyle = colorBlue;
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(30 * scale, 30 * scale, w - 60 * scale, h - 60 * scale);

  // 4. Header: Platform Identity
  ctx.fillStyle = colorNavy;
  ctx.textAlign = 'center';
  ctx.font = `bold ${24 * scale}px "Inter", sans-serif`;
  ctx.fillText(data.platformName.toUpperCase(), w / 2, 80 * scale);
  
  // Decorative separator
  ctx.beginPath();
  ctx.moveTo(w / 2 - 40 * scale, 100 * scale);
  ctx.lineTo(w / 2 + 40 * scale, 100 * scale);
  ctx.strokeStyle = colorNavy;
  ctx.lineWidth = 0.5 * scale;
  ctx.stroke();

  // 5. Typographic Hierarchy: Body
  ctx.fillStyle = colorGray;
  ctx.font = `normal ${13 * scale}px "Inter", sans-serif`;
  ctx.fillText('CERTIFICATE OF COMPLETION', w / 2, 150 * scale);

  ctx.fillStyle = colorNavy;
  ctx.font = `normal ${14 * scale}px "Inter", sans-serif`;
  ctx.fillText('THIS IS TO CERTIFY THAT', w / 2, 210 * scale);

  // 6. Identity Node: Student Name (Unicode Safe)
  ctx.fillStyle = colorBlue;
  ctx.font = `bold ${32 * scale}px "Inter", sans-serif`;
  ctx.fillText(data.studentName.toUpperCase(), w / 2, 270 * scale);

  // 7. Achievement Context
  ctx.fillStyle = colorNavy;
  ctx.font = `normal ${13 * scale}px "Inter", sans-serif`;
  ctx.fillText('HAS SUCCESSFULLY COMPLETED THE ASSESSMENT MODULE', w / 2, 320 * scale);

  ctx.font = `bold ${16 * scale}px "Inter", sans-serif`;
  ctx.fillText(data.testName.toUpperCase(), w / 2, 360 * scale);

  // 8. Performance Metrics Row
  const percentage = Math.round((data.score / (data.total || 1)) * 100);
  ctx.fillStyle = colorGray;
  ctx.font = `normal ${11 * scale}px "Inter", sans-serif`;
  
  ctx.textAlign = 'left';
  ctx.fillText(`DATE COMPLETED: ${format(data.date, 'MMMM dd, yyyy').toUpperCase()}`, 60 * scale, 410 * scale);
  
  ctx.textAlign = 'right';
  ctx.fillText(`ACHIEVED PRECISION: ${percentage}% (${data.score}/${data.total})`, w - 60 * scale, 410 * scale);

  // 9. Registry Metadata: Verification ID
  ctx.textAlign = 'center';
  ctx.font = `normal ${8 * scale}px "Inter", sans-serif`;
  ctx.fillText(`VERIFICATION ID: ${data.certificateId}`, w / 2, 530 * scale);

  // 10. Branding Protocol: Seal Handshake
  await new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Background circle for visual stability
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w / 2, 470 * scale, 42 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.drawImage(img, w / 2 - 40 * scale, 430 * scale, 80 * scale, 80 * scale);
      resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = '/brand/certificate-seal.png';
  });

  // 11. PDF Extraction Sequence
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  // Add the rendered canvas as a high-quality PNG node
  const imgData = canvas.toDataURL('image/png', 1.0);
  doc.addImage(imgData, 'PNG', 0, 0, 842, 595, undefined, 'FAST');
  
  // Terminate and Save
  doc.save(`Certificate_${data.studentName.replace(/\s+/g, '_')}_${data.testName.replace(/\s+/g, '_')}.pdf`);
}
