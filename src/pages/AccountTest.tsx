import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";

import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AccountTest() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auth validation (like the original component) but NO database calls
  useEffect(() => {
    if (!authLoading && (!user || !user.id || !user.email)) {
      toast({
        title: "Inloggen vereist",
        description: "Je moet inloggen om je account te beheren.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  }, [user, authLoading, navigate, toast]);

  // Show loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Authenticatie controleren...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no valid user, don't show anything (redirect is happening)
  if (!user || !user.id || !user.email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h1 className="text-2xl font-bold">✅ FULL AUTH FLOW - NO DATABASE</h1>
            <p>Deze pagina doet volledige auth validatie ZONDER database calls.</p>
            <p>Je bent succesvol ingelogd!</p>
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <h2 className="text-lg font-bold mb-2">Ingelogde Gebruiker:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Email:</strong> taxi@frades.be</li>
              <li><strong>User ID:</strong> {user.id}</li>
              <li><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <h2 className="text-lg font-bold mb-2">Debug Info:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Route: /account werkt</li>
              <li>Component wordt geladen</li>
              <li>Geen auth verificatie</li>
              <li>Geen database queries</li>
              <li>Server is functioneel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}