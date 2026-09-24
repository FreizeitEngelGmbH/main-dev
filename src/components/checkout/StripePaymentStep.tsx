import { Button } from "@/components/ui/button";

/**
 * STATIC: recreated from EngelFolder's components/checkout/StripePaymentStep.tsx with the same
 * default export and props. The original loads Stripe (@stripe/react-stripe-js, @stripe/stripe-js,
 * js.stripe.com) and confirms payments; neither package is installed and no payment provider is
 * connected in this build. This version only shows the original's own "not available" message and
 * never calls onSuccess, creates a payment or contacts Stripe.
 */
export default function StripePaymentStep({ clientSecret, amount, onSuccess, onCancel }: {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-3" data-testid="payment-unavailable">
      <p className="text-sm text-red-600 py-4">Online-Zahlung ist derzeit nicht verfügbar.</p>
      {onCancel && (
        <Button type="button" variant="ghost" className="w-full h-12 rounded-xl" onClick={onCancel}>
          Zurück
        </Button>
      )}
    </div>
  );
}
