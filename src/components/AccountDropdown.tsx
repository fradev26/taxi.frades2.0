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
      icon: HelpCircle,
      label: "Hulp",
      onClick: () => {
        // Navigate to help page or open help modal
        setIsOpen(false);
      }
    },
    {
      icon: Wallet,
      label: "Wallet",
      onClick: () => {
        navigate(ROUTES.WALLET);
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
    },
    {
      icon: Settings,
      label: "Beheer het account",
      onClick: () => {
        navigate(ROUTES.ACCOUNT);
        setIsOpen(false);
      }
    },
    {
      icon: FileText,
      label: "Belastingprofiel",
      onClick: () => {
        // Navigate to tax profile page
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
      {/* Account Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "gap-2 h-10 px-3 transition-all duration-200",
          isOpen && "bg-accent"
        )}
      >
        <User className="w-5 h-5 text-foreground" />
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className={cn(
          "absolute right-0 top-12 w-64 shadow-lg border-0 z-50",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
        )}>
          <CardContent className="p-0">
            {/* User Info Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user?.email || "Gebruiker"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Persoonlijk account
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors duration-150"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              ))}
            </div>

            <Separator />

            {/* Logout Button */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-2 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-150"
              >
                <LogOut className="w-4 h-4" />
                <span>Uitloggen</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}