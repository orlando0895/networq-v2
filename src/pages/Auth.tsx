
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check for email prefill from URL params and handle user redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get('email');
    
    // DIAGNOSTIC: Check for auth errors from URL params
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const errorCode = searchParams.get('error_code');
    
    if (error) {
      console.error('Auth URL Error:', {
        error,
        errorDescription,
        errorCode,
        fullURL: window.location.href,
        params: Object.fromEntries(searchParams.entries())
      });
      
      toast({
        title: "Authentication Error",
        description: errorDescription || error || "An authentication error occurred",
        variant: "destructive",
      });
    }
    
    if (emailParam) {
      setEmail(emailParam);
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (user) {
      navigate('/app');
      return;
    }

    // Listen for auth state changes with verbose logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', {
        event,
        user: session?.user?.id,
        provider: session?.user?.app_metadata?.provider,
        timestamp: new Date().toISOString()
      });
      
      if (event === 'SIGNED_IN' && session) {
        navigate('/app');
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, [user, navigate, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        const redirectUrl = `${window.location.origin}/app`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred with Google sign in.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    console.log('Starting Apple auth with redirect:', `${window.location.origin}/app`);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/app`,
          scopes: 'name email'
        }
      });

      if (error) {
        console.error('Apple OAuth initiation error:', error);
        if (error.message.includes('provider not enabled')) {
          throw new Error('Apple sign-in is not configured. Please contact support.');
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Apple auth error:', error);
      toast({
        title: "Apple Sign-in Error", 
        description: error.message || "An error occurred with Apple sign in.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset email sent!",
        description: "Please check your email for password reset instructions.",
      });
      
      setIsResetPassword(false);
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
              {isResetPassword 
                ? 'Reset your password'
                : isLogin 
                ? 'Sign in to Networq' 
                : 'Create your Networq account'
              }
            </CardTitle>
            <CardDescription>
              {isResetPassword
                ? 'Enter your email to receive password reset instructions'
                : isLogin 
                ? 'Enter your credentials to access your network' 
                : 'Start building your professional network today'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isResetPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>
          )}
          
          {!isResetPassword && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleAuth}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {loading ? 'Please wait...' : 'Continue with Google'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full bg-foreground text-background hover:bg-foreground/90 border-foreground" 
                  onClick={handleAppleAuth}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  {loading ? 'Please wait...' : 'Continue with Apple'}
                </Button>
              </div>
            </>
          )}
          
          <div className="mt-4 text-center space-y-2">
            {isResetPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsResetPassword(false);
                  setEmail('');
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Back to sign in
              </button>
            ) : (
              <>
                {isLogin && (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => setIsResetPassword(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
