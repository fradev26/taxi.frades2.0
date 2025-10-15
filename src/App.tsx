import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ROUTES } from "@/constants";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Wallet from "./pages/Wallet";
import Trips from "./pages/Trips";
import Account from "./pages/Account";
import AccountDebug from "./pages/AccountDebug";
import AccountSimple from "./pages/AccountSimple";
import AccountTest from "./pages/AccountTest";
import DatabaseTest from "./pages/DatabaseTest";
import DatabaseTestSimple from "./pages/DatabaseTestSimple";
import AccountTestBasic from "./pages/AccountTestBasic";

// Lazy load admin and less frequently used pages
const Admin = lazy(() => import("./pages/Admin"));
const TestHourlyBooking = lazy(() => import("./pages/TestHourlyBooking"));
const Profile = lazy(() => import("./pages/Profile"));
const TaxProfile = lazy(() => import("./pages/TaxProfile"));
const BelastingProfielZakelijk = lazy(() => import("./pages/BelastingProfielZakelijk"));
const PricingTest = lazy(() => import("./pages/PricingTest"));
const OverOns = lazy(() => import("./pages/OverOns"));
const VoorBedrijven = lazy(() => import("./pages/VoorBedrijven"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const SalesTerms = lazy(() => import("./pages/SalesTerms"));
const LegalInfo = lazy(() => import("./pages/LegalInfo"));
const SiteMap = lazy(() => import("./pages/SiteMap"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Debug = lazy(() => import("./pages/Debug"));
// CityToCityRides import verwijderd
const AirportTransfers = lazy(() => import("./pages/AirportTransfers"));
const PrivateChauffeur = lazy(() => import("./pages/PrivateChauffeur"));
const ChauffeurHailing = lazy(() => import("./pages/ChauffeurHailing"));
const HorecaEventsService = lazy(() => import("./pages/HorecaEventsService"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
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
                  <Route path={ROUTES.BUSINESS_TAX_PROFILE} element={<BelastingProfielZakelijk />} />
                  <Route path={ROUTES.OVER_ONS} element={<OverOns />} />
                  <Route path={ROUTES.VOOR_BEDRIJVEN} element={<VoorBedrijven />} />
                  <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
                  <Route path={ROUTES.COOKIE_POLICY} element={<CookiePolicy />} />
                  <Route path={ROUTES.TERMS_OF_SERVICE} element={<TermsOfService />} />
                  <Route path={ROUTES.SALES_TERMS} element={<SalesTerms />} />
                  <Route path={ROUTES.LEGAL_INFO} element={<LegalInfo />} />
                  <Route path={ROUTES.SITE_MAP} element={<SiteMap />} />
                  <Route path="/services/airport-transfers" element={<AirportTransfers />} />
                  <Route path="/services/private-chauffeur" element={<PrivateChauffeur />} />
                  <Route path="/services/chauffeur-hailing" element={<ChauffeurHailing />} />
                  <Route path="/services/horeca-events" element={<HorecaEventsService />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
