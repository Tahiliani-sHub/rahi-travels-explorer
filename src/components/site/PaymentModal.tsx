import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentForm } from "./PaymentForm";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  bookingType: string;
  bookingDetails?: Record<string, unknown>;
  onComplete?: () => void;
}

export function PaymentModal({ open, onClose, amount, bookingType, bookingDetails, onComplete }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="px-8 pt-8 pb-0">
          <DialogTitle className="text-xl font-bold">Complete your booking</DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-8 pt-4">
          <PaymentForm
            initialAmount={amount}
            bookingType={bookingType}
            bookingDetails={bookingDetails}
            onComplete={() => {
              onClose();
              onComplete?.();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
