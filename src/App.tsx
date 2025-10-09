import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ROUTES } from "@/constants";
import React, { Suspense } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Wallet from "./pages/Wallet";
import Trips from "./pages/Trips";
import Account from "./pages/Account";

// Lazy load admin and less frequently used pages
const Admin = React.lazy(() => import("./pages/Admin"));
const HourlyBooking = React.lazy(() => import("./pages/HourlyBooking"));
const Profile = React.lazy(() => import("./pages/Profile"));
const DevelopmentDashboard = React.lazy(() => import("./pages/DevelopmentDashboard"));
const TaxProfile = React.lazy(() => import("./pages/TaxProfile"));
const BelastingProfielZakelijk = React.lazy(() => import("./pages/BelastingProfielZakelijk"));
const PricingTest = React.lazy(() => import("./pages/PricingTest"));
const OverOns = React.lazy(() => import("./pages/OverOns"));
const VoorBedrijven = React.lazy(() => import("./pages/VoorBedrijven"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const SalesTerms = React.lazy(() => import("./pages/SalesTerms"));
const LegalInfo = React.lazy(() => import("./pages/LegalInfo"));
const SiteMap = React.lazy(() => import("./pages/SiteMap"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Debug = React.lazy(() => import("./pages/Debug"));
const CityToCityRides = React.lazy(() => import("./pages/CityToCityRides"));
const AirportTransfers = React.lazy(() => import("./pages/AirportTransfers"));
const HourlyFullDayHire = React.lazy(() => import("./pages/HourlyFullDayHire"));
const ChauffeurHailing = React.lazy(() => import("./pages/ChauffeurHailing"));

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
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <Routes>
                  <Route path={ROUTES.HOME} element={<Index />} />
                  <Route path={ROUTES.LOGIN} element={<Login />} />
                  <Route path={ROUTES.WALLET} element={<Wallet />} />
                <Route path={ROUTES.TRIPS} element={<Trips />} />
                <Route path={ROUTES.ACCOUNT} element={<Account />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.TAX_PROFILE} element={<TaxProfile />} />
                <Route path={ROUTES.ADMIN} element={<Admin />} />
                <Route path={ROUTES.HOURLY_BOOKING} element={<HourlyBooking />} />
                <Route path={ROUTES.BUSINESS_TAX_PROFILE} element={<BelastingProfielZakelijk />} />
                <Route path="/pricing-test" element={<PricingTest />} />
                <Route path={ROUTES.OVER_ONS} element={<OverOns />} />
                <Route path={ROUTES.VOOR_BEDRIJVEN} element={<VoorBedrijven />} />
                <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
                <Route path={ROUTES.COOKIE_POLICY} element={<CookiePolicy />} />
                <Route path={ROUTES.TERMS_OF_SERVICE} element={<TermsOfService />} />
                <Route path={ROUTES.SALES_TERMS} element={<SalesTerms />} />
                <Route path={ROUTES.LEGAL_INFO} element={<LegalInfo />} />
                <Route path={ROUTES.SITE_MAP} element={<SiteMap />} />
                <Route path="/services/city-to-city" element={<CityToCityRides />} />
                <Route path="/services/airport-transfers" element={<AirportTransfers />} />
                <Route path="/services/hourly-full-day" element={<HourlyFullDayHire />} />
                <Route path="/services/chauffeur-hailing" element={<ChauffeurHailing />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="/dev-dashboard" element={<DevelopmentDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
