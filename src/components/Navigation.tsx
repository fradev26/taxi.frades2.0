import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AccountDropdown } from "@/components/AccountDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Car, Wallet, Clock, User, Settings, Menu, X, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, APP_CONFIG } from "@/constants";

export const Navigation = React.memo(function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Fout bij uitloggen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Uitgelogd",
          description: "Je bent succesvol uitgelogd.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Fout bij uitloggen",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  };

  // Memoize navigation items to prevent recreation on every render
  const headerNavigationItems = useMemo(() => 
    user
      ? [{ label: "Boeken", path: ROUTES.HOME, icon: Car }]
      : [
          { label: "Boeken", path: ROUTES.HOME, icon: Car },
          { label: "Inloggen", path: ROUTES.LOGIN, icon: User },
        ],
    [user]
  );

  // Mobile navigation items for hamburger menu - consistent with AccountDropdown
  const mobileMenuItems = useMemo(() =>
    user
      ? [
          { label: "Wallet", path: ROUTES.WALLET, icon: Wallet },
          { label: "Profiel", path: ROUTES.PROFILE, icon: UserCircle },
          { label: "Activiteit", path: ROUTES.TRIPS, icon: Clock }
        ]
      : [
          { label: "Inloggen", path: ROUTES.LOGIN, icon: User },
        ],
    [user]
  );

  // Mobile bottom navigation items - consistent with hamburger menu
  const mobileNavigationItems = useMemo(() =>
    user
      ? [
          { label: "Boeken", path: ROUTES.HOME, icon: Car },
          { label: "Wallet", path: ROUTES.WALLET, icon: Wallet },
          { label: "Profiel", path: ROUTES.PROFILE, icon: UserCircle },
          { label: "Activiteit", path: ROUTES.TRIPS, icon: Clock }
        ]
      : [
          { label: "Boeken", path: ROUTES.HOME, icon: Car },
          { label: "Inloggen", path: ROUTES.LOGIN, icon: User },
        ],
    [user]
  );

  const isActive = useCallback((path: string) => {
    // Handle tab-based navigation
    if (path.includes('?tab=')) {
      const [basePath, tabQuery] = path.split('?');
      const currentTab = new URLSearchParams(location.search).get('tab');
      const expectedTab = new URLSearchParams(tabQuery).get('tab');
      return location.pathname === basePath && currentTab === expectedTab;
    }
    
    // For the "Boeken" button (ROUTES.HOME), show as active when on home page (with or without tabs)
    if (path === ROUTES.HOME && location.pathname === ROUTES.HOME) return true;
    
    // For other paths, check if current path starts with the item path
    if (path !== ROUTES.HOME && location.pathname.startsWith(path)) return true;
    
    return false;
  }, [location.pathname, location.search]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between w-full px-6 py-4 bg-card border-b border-border">
        {/* Left spacer for centering */}
        <div className="flex-1"></div>
        
        {/* Centered Logo */}
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-bold text-primary">
            {APP_CONFIG.name}
          </span>
        </button>

        {/* Right side navigation */}
        <div className="flex items-center space-x-1 flex-1 justify-end">
          {headerNavigationItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "taxi-primary" : "taxi-ghost"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="gap-2"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
          <ThemeToggle />
          {user && <AccountDropdown />}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between w-full px-4 py-3 bg-card border-b border-border">
          {/* Hamburger Menu Button */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          )}
          
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="hover:opacity-80 transition-opacity"
          >
            <span className="text-lg font-bold text-primary">
              {APP_CONFIG.name}
            </span>
          </button>

          <ThemeToggle />
        </div>

        {/* Mobile Side Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Side Menu */}
        <div className={`
          fixed top-0 left-0 h-full w-80 max-w-[80vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <span className="text-xl font-bold text-primary">
              {APP_CONFIG.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info Section */}
          {user && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 truncate">
                    {user.email || "Gebruiker"}
                  </p>
                  <p className="text-sm text-gray-500">
                    5 ⭐ • Premium lid
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          {user && (
            <div className="py-4">
              {mobileMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full justify-start gap-4 px-6 py-4 h-auto rounded-none text-left
                    ${isActive(item.path) 
                      ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive(item.path) ? 'bg-primary text-white' : 'bg-gray-100'}
                  `}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-base font-medium">{item.label}</span>
                </Button>
              ))}
              
              {/* Logout option */}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-4 px-6 py-4 h-auto rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-base font-medium">Uitloggen</span>
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              © 2024 {APP_CONFIG.name} • Versie 2.0
            </p>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          {mobileNavigationItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "taxi-primary" : "taxi-ghost"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex-col gap-1 h-16"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
});