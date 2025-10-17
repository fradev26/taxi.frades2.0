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
import { getCurrentUserProfile } from "@/services/userService";

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user profile when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const { data } = await getCurrentUserProfile();
        setUserProfile(data);
      }
    };
    loadUserProfile();
  }, [user]);

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
    if (userProfile?.first_name) {
      return userProfile.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get display name for user
  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.email) {
      return user.email;
    }
    return "Gebruiker";
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

      {/* Dropdown Menu - Clean Icon Style */}
      {isOpen && (
        <Card className={cn(
          "absolute right-0 top-14 w-auto shadow-xl border-2 border-gray-200 z-50 bg-white rounded-xl",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
          "luxury-solid-bg luxury-rounded"
        )}
        style={{ backgroundColor: 'white', opacity: 1 }}>
          <CardContent className="p-0">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <span className="text-base font-medium">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {getUserDisplayName()}
                  </p>
                </div>
              </div>
            </div>

            {/* Icon Menu Items */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    title={item.label}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-150"
                  >
                    <item.icon className="w-5 h-5 text-gray-700" />
                  </button>
                ))}
                
                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  title="Uitloggen"
                  className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-150"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}