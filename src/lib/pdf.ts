import PDFDocument from 'pdfkit';

export async function generateBookingPDF(bookingData: {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  bookingDetails: any;
  totalAmount: number;
  currency: string;
  bookingDate: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(24).font('Helvetica-Bold').text('Booking Confirmation', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Booking Details', { underline: true });
    doc.fontSize(11).font('Helvetica');

    doc.moveDown(0.5);
    doc.text(`Booking ID: ${bookingData.bookingId}`);
    doc.text(`Date: ${bookingData.bookingDate}`);
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Customer Information', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.moveDown(0.5);
    doc.text(`Name: ${bookingData.customerName}`);
    doc.text(`Email: ${bookingData.customerEmail}`);
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Trip Details', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.moveDown(0.5);

    if (typeof bookingData.bookingDetails === 'object') {
      Object.entries(bookingData.bookingDetails).forEach(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        doc.text(`${label}: ${displayValue}`);
      });
    }

    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('Total Amount', { underline: true });
    doc.fontSize(12).font('Helvetica-Bold').text(
      `${bookingData.totalAmount.toFixed(2)} ${bookingData.currency}`
    );

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica').text(
      '© 2026 Rahi Travels - Premium Tunisia Travel Booking Platform',
      { align: 'center' }
    );

    doc.end();
  });
}
