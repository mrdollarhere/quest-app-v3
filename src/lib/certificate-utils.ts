
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
 * High-Precision Certificate Generation Protocol
 * Generates a professional completion certificate client-side.
 */
export async function generateCertificatePDF(data: CertificateData) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background Design
  doc.setFillColor(244, 245, 247); // Slate 50
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative Border
  doc.setDrawColor(37, 99, 235); // Primary Blue
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
  
  doc.setDrawColor(15, 23, 42); // Slate 900
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

  // Brand Header
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(data.platformName.toUpperCase(), pageWidth / 2, 40, { align: 'center' });
  
  doc.setDrawColor(37, 99, 235, 0.2);
  doc.line(pageWidth / 2 - 20, 45, pageWidth / 2 + 20, 45);

  // Main Content
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 65, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text('THIS IS TO CERTIFY THAT', pageWidth / 2, 85, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(37, 99, 235);
  doc.text(data.studentName.toUpperCase(), pageWidth / 2, 105, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('HAS SUCCESSFULLY COMPLETED THE ASSESSMENT MODULE', pageWidth / 2, 125, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(data.testName, pageWidth / 2, 140, { align: 'center' });

  // Score & Date Section
  const percentage = Math.round((data.score / data.total) * 100);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  
  doc.text(`DATE COMPLETED: ${format(data.date, 'MMMM dd, yyyy')}`, 40, 170);
  doc.text(`ACHIEVED PRECISION: ${percentage}% (${data.score}/${data.total})`, pageWidth - 40, 170, { align: 'right' });

  // Verification Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`VERIFICATION ID: ${data.certificateId}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save the result
  doc.save(`Certificate_${data.studentName.replace(/\s+/g, '_')}_${data.testName.replace(/\s+/g, '_')}.pdf`);
}
