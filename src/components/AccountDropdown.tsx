import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, ChevronDown, CircleHelp as HelpCircle, Wallet, Clock, Settings, FileText, LogOut, CircleUser as UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { CompactWalletBalance } from "@/components/WalletBalance";

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Uitloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd.",
      });
    }
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: Wallet,
      label: "Wallet",
      onClick: () => {
        navigate(ROUTES.WALLET);
        setIsOpen(false);
      }
    },
    {
      icon: UserCircle,
      label: "Profiel",
      onClick: () => {
        navigate(ROUTES.PROFILE);
        setIsOpen(false);
      }
    },
    {
      icon: Clock,
      label: "Activiteit",
      onClick: () => {
        navigate(ROUTES.TRIPS);
        setIsOpen(false);
      }
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Account Button - Uber Style */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-full px-4 py-2 h-auto"
      >
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">
            {getUserInitials()}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-600 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {/* Dropdown Menu - Uber Style */}
      {isOpen && (
        <Card className={cn(
          "absolute right-0 top-14 w-72 shadow-xl border-0 z-50 bg-white",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
        )}>
          <CardContent className="p-0">
            {/* User Info Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base text-gray-900 truncate">
                    {user?.email || "Gebruiker"}
                  </p>
                  <div className="mt-1">
                    <CompactWalletBalance />
                  </div>
                  <p className="text-sm text-gray-500">
                    5 ⭐ • Lid sinds 2024
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 px-6 py-4 text-sm hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-700" />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-900">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-6 py-4 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-medium">Uitloggen</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}