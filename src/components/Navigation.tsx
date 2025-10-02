import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AccountDropdown } from "@/components/AccountDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Car, Wallet, Clock, User, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, APP_CONFIG } from "@/constants";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Header navigation items - only show Boeken and Login/Account
  const headerNavigationItems = user
    ? [
        { label: "Boeken", path: ROUTES.HOME, icon: Car }
      ]
    : [
        { label: "Boeken", path: ROUTES.HOME, icon: Car },
        { label: "Inloggen", path: ROUTES.LOGIN, icon: User },
      ];

  // Mobile bottom navigation items - show all navigation
  const mobileNavigationItems = user
    ? [
        { label: "Boeken", path: ROUTES.HOME, icon: Car },
        { label: "Wallet", path: ROUTES.WALLET, icon: Wallet },
        { label: "Account", path: ROUTES.ACCOUNT, icon: User },
        ...(isAdmin ? [{ label: "Admin", path: ROUTES.ADMIN, icon: Settings }] : [])
      ]
    : [
        { label: "Boeken", path: ROUTES.HOME, icon: Car },
        { label: "Inloggen", path: ROUTES.LOGIN, icon: User },
      ];

  const isActive = (path: string) => {
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
  };

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
}