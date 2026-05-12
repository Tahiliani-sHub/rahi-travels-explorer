import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Share2 } from 'lucide-react';

interface BookingConfirmationProps {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  bookingDetails: any;
  totalAmount: number;
  currency?: string;
  bookingDate?: string;
}

export function BookingConfirmation({
  bookingId,
  customerName,
  customerEmail,
  bookingDetails,
  totalAmount,
  currency = 'TND',
  bookingDate = new Date().toLocaleDateString()
}: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    // In production, generate and download PDF
    alert('PDF download coming soon. Booking ID: ' + bookingId);
  };

  const handleShare = () => {
    const text = `I just booked with Rahi Travels! Booking ID: ${bookingId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Rahi Travels Booking',
        text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Booking details copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground">Your travel arrangement is secured</p>
      </div>

      {/* Confirmation Card */}
      <div className="rounded-3xl border border-border bg-white p-8 shadow-sm mb-6">
        {/* Booking ID Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
          <div className="flex items-center justify-between bg-primary/5 p-4 rounded-lg">
            <code className="text-lg font-mono font-bold text-primary">{bookingId}</code>
            <button
              onClick={handleCopy}
              className="text-sm px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
            <p className="font-semibold text-foreground">{customerName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <p className="font-semibold text-foreground">{customerEmail}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Booking Date</p>
            <p className="font-semibold text-foreground">{bookingDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="font-semibold text-primary text-lg">
              {totalAmount.toFixed(2)} {currency}
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6">
          <p className="text-sm font-semibold text-foreground mb-3">Booking Details</p>
          <div className="text-sm text-muted-foreground space-y-2">
            {Object.entries(bookingDetails).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium text-foreground">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            ✓ <strong>Confirmed</strong> - A confirmation email has been sent to {customerEmail}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <a
            href="/bookings"
            className="flex items-center justify-center gap-2 px-4 py-2 btn-primary rounded-lg text-center"
          >
            View Bookings
          </a>
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-lg border border-border bg-muted/50 p-6">
        <h3 className="font-semibold text-foreground mb-4">Next Steps</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="font-bold text-primary min-w-6">1</span>
            <span>Check your email for the full booking confirmation and itinerary</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary min-w-6">2</span>
            <span>Add this booking to your calendar for important dates</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary min-w-6">3</span>
            <span>Contact us via WhatsApp +216 71 000 000 if you need to modify your booking</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary min-w-6">4</span>
            <span>Arrive at your destination on time - have a great trip! ✈️</span>
          </li>
        </ol>
      </div>

      {/* Contact Support */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">Need help?</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="tel:+21671000000"
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted"
          >
            📞 Call Us
          </a>
          <a
            href="https://wa.me/21671000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
