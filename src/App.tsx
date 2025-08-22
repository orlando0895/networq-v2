
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavigation from "@/components/BottomNavigation";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Events from "./pages/Events";
import Discovery from "./pages/Discovery";
import Profile from "./pages/Profile";
import ProfileManagement from "./pages/ProfileManagement";
import ViewContact from "./pages/ViewContact";
import { PublicProfile } from "./pages/PublicProfile";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { Support } from "./pages/Support";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <BottomNavigation />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/public/:identifier" element={<PublicProfile />} />
              <Route path="/contact/:shareCode" element={<ViewContact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Index />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Events />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discovery"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Discovery />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Messages />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Profile />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/manage"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <ProfileManagement />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Landing />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
