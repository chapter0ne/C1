import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentStatusProps {
  isProcessing: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaymentStatus = ({ isProcessing, onSuccess, onError }: PaymentStatusProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isProcessing) {
      setStatus('processing');
      setMessage('Initializing payment...');
    }
  }, [isProcessing]);

  const handlePaymentSuccess = () => {
    setStatus('success');
    setMessage('Payment successful! Redirecting to verification...');
    onSuccess?.();
  };

  const handlePaymentError = (error: string) => {
    setStatus('failed');
    setMessage(error);
    onError?.(error);
  };

  if (status === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-16 h-16 text-[#D01E1E] mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CreditCard className="w-4 h-4" />
              <span>Initializing Paystack</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CreditCard className="w-4 h-4" />
              <span>Creating transaction</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CreditCard className="w-4 h-4" />
              <span>Redirecting to payment</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Initiated</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">
            You will be redirected to Paystack to complete your payment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'failed') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#D01E1E] hover:bg-[#B01818]"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PaymentStatus;

