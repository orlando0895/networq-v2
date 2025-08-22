
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Block access if user is in password recovery flow
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);
  const isRecoveryLink = hash.includes('type=recovery') || (searchParams.has('type') && searchParams.get('type') === 'recovery');
  
  if (isRecoveryLink) {
    return <Navigate to="/reset-password" replace />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
