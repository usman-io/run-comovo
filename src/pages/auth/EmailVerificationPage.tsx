
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { authService } from '@/contexts/auth/authService';
import { emailVerificationApi } from '@/services/api';

const EmailVerificationPage = () => {
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = location.state?.email || '';
  const token = searchParams.get('token');

  // If there's a token in the URL, automatically verify
  useEffect(() => {
    if (token) {
      handleVerification(token);
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      await authService.verifyEmail(verificationToken);
      setVerificationStatus('success');
      toast.success('Email verified successfully! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      toast.error(error instanceof Error ? error.message : 'Email verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification(email);
      toast.success('Verification email resent! Please check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
          <p className="text-gray-600">
            Your email has been successfully verified. You will be redirected to the login page shortly.
          </p>
        </div>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <div className="text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
          <p className="text-gray-600">
            The verification link is invalid or has expired. Please request a new verification email.
          </p>
          {email && (
            <Button 
              onClick={handleResendEmail} 
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      );
    }

    // Default pending state
    return (
      <div className="text-center space-y-6">
        <Mail className="w-12 h-12 text-blue-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification link to:
          <br />
          <strong className="text-gray-900">{email}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Click the link in the email to verify your account. Don't forget to check your spam folder!
        </p>
        
        <div className="space-y-3">
          {/* <Button 
            onClick={handleResendEmail} 
            disabled={isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </Button> */}
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="app-container max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmailVerificationPage;
