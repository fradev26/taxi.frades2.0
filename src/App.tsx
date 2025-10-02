import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ROUTES } from "@/constants";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Wallet from "./pages/Wallet";
import Trips from "./pages/Trips";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import HourlyBooking from "./pages/HourlyBooking";
import PricingTest from "./pages/PricingTest";
import BelastingProfielZakelijk from "./pages/BelastingProfielZakelijk";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsOfService from "./pages/TermsOfService";
import SalesTerms from "./pages/SalesTerms";
import LegalInfo from "./pages/LegalInfo";
import SiteMap from "./pages/SiteMap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" attribute="class">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path={ROUTES.HOME} element={<Index />} />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.WALLET} element={<Wallet />} />
                <Route path={ROUTES.TRIPS} element={<Trips />} />
                <Route path={ROUTES.ACCOUNT} element={<Account />} />
                <Route path={ROUTES.ADMIN} element={<Admin />} />
                <Route path={ROUTES.HOURLY_BOOKING} element={<HourlyBooking />} />
                <Route path={ROUTES.BUSINESS_TAX_PROFILE} element={<BelastingProfielZakelijk />} />
                <Route path="/pricing-test" element={<PricingTest />} />
                <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
                <Route path={ROUTES.COOKIE_POLICY} element={<CookiePolicy />} />
                <Route path={ROUTES.TERMS_OF_SERVICE} element={<TermsOfService />} />
                <Route path={ROUTES.SALES_TERMS} element={<SalesTerms />} />
                <Route path={ROUTES.LEGAL_INFO} element={<LegalInfo />} />
                <Route path={ROUTES.SITE_MAP} element={<SiteMap />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
