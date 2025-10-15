import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AccountSimple() {
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Wait for auth to complete
      if (authLoading) return;
      
      // Check if we have a user
      if (!user) {
        toast({
          title: "Inloggen vereist", 
          description: "Je moet inloggen om je account te beheren.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Double check session validity
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sessie verlopen",
          description: "Je sessie is verlopen. Log opnieuw in.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      setIsChecking(false);
    };

    checkAuthAndRedirect();
  }, [user, authLoading, navigate, toast]);

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Verificatie van toegang...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">🔧 NIEUWE ACCOUNT PAGINA 🔧</h1>
              <p className="text-muted-foreground mb-6">
                Dit is de nieuwe, vereenvoudigde account pagina. Als je dit ziet, werkt de fix!
              </p>
              <div className="space-x-4">
                <Button onClick={() => navigate("/")} variant="default">
                  Terug naar hoofdpagina
                </Button>
                <Button onClick={() => navigate("/profiel")} variant="outline">
                  Ga naar profiel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}