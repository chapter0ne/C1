import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, BookOpen, Home } from "lucide-react";
import UniversalHeader from "@/components/UniversalHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useToast } from "@/hooks/use-toast";

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { verifyPayment } = useCart(user?.id || '');
  const { toast } = useToast();
  
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      
      if (!reference && !trxref) {
        setVerificationStatus('failed');
        setVerificationMessage('No payment reference found');
        return;
      }

      const paymentRef = reference || trxref;
      
      if (!paymentRef) {
        setVerificationStatus('failed');
        setVerificationMessage('Invalid payment reference');
        return;
      }

      setIsProcessing(true);
      
      try {
        // Verify payment with Paystack
        await verifyPayment.mutateAsync(paymentRef);
        
        setVerificationStatus('success');
        setVerificationMessage('Payment verified successfully! Your books have been added to your library.');
        
        toast({
          title: "Payment Successful!",
          description: "Your books have been added to your library. You now have lifetime access to them.",
          duration: 5000,
        });
        
      } catch (error) {
        console.error('Payment verification failed:', error);
        setVerificationStatus('failed');
        setVerificationMessage(error instanceof Error ? error.message : 'Payment verification failed');
        
        toast({
          title: "Payment Verification Failed",
          description: "There was an issue verifying your payment. Please contact support.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPaymentStatus();
  }, [searchParams, verifyPayment, toast]);

  const handleGoToLibrary = () => {
    navigate('/library');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (verificationStatus === 'verifying' || isProcessing) {
    return (
      <div className="min-h-screen bg-white">
        <UniversalHeader currentPage="payment" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#D01E1E] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UniversalHeader currentPage="payment" />
      
      <div className="flex-1 flex items-center justify-center pb-20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            {verificationStatus === 'success' ? (
              <>
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">{verificationMessage}</p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleGoToLibrary}
                    className="w-full bg-[#D01E1E] hover:bg-[#B01818]"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Go to Library
                  </Button>
                  
                  <Button 
                    onClick={handleGoHome}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>
                <p className="text-gray-600 mb-6">{verificationMessage}</p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/cart')}
                    className="w-full bg-[#D01E1E] hover:bg-[#B01818]"
                  >
                    Return to Cart
                  </Button>
                  
                  <Button 
                    onClick={handleGoHome}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default PaymentVerification;

