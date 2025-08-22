import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isExpiredLink, setIsExpiredLink] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery state in URL hash or search params
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const isRecoveryLink = hash.includes('type=recovery') || searchParams.has('type') && searchParams.get('type') === 'recovery';
    
    if (!isRecoveryLink) {
      // No recovery link found, redirect to auth
      navigate('/auth');
      return;
    }

    // Listen for auth state changes to detect recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setHasValidSession(true);
        // Clean up URL after Supabase has processed the recovery
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname);
        }, 100);
      }
    });

    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      } else {
        setIsExpiredLink(true);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated. Please sign in with your new password.",
      });

      // Sign out the user after password update
      await supabase.auth.signOut();

      // Clean up URL and navigate to auth with email prefilled
      window.history.replaceState(null, '', window.location.pathname);
      navigate(`/auth?email=${encodeURIComponent(email || '')}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset email sent!",
        description: "Please check your email for a new password reset link.",
      });
      
      setEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/5fd3099a-4877-4566-8bd3-54ab04eb7899.png" 
              alt="Networq Logo" 
              className="h-16 w-auto"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {isExpiredLink ? 'Reset link expired' : 'Set your new password'}
            </CardTitle>
            <CardDescription>
              {isExpiredLink 
                ? 'Your reset link has expired. Enter your email to get a new one.'
                : 'Enter a new password for your account'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isExpiredLink ? (
            <form onSubmit={handleResendResetEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send New Reset Link'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This helps us prefill your email on the sign-in page.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading || !hasValidSession}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
              
              {!hasValidSession && (
                <p className="text-sm text-amber-600 text-center">
                  Processing your reset link...
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;