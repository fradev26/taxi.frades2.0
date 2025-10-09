import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { signIn } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Debug() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);

  const testLogin = async () => {
    setTestLoading(true);
    try {
      const { error } = await signIn("test@example.com", "testpassword");
      if (error) {
        toast({
          title: "Test Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Login Successful",
          description: "You are now logged in with test account",
        });
      }
    } catch (err) {
      toast({
        title: "Test Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Authentication Status:</h3>
              <p>Loading: {isLoading ? 'true' : 'false'}</p>
              <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
              {user && (
                <div className="mt-2">
                  <p>Email: {user.email}</p>
                  <p>ID: {user.id}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Test Actions:</h3>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={testLogin} 
                  disabled={testLoading || !!user}
                  variant="default"
                >
                  {testLoading ? "Logging in..." : "Test Login"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Test Links:</h3>
              <div className="flex gap-2 flex-wrap">
                <Button asChild variant="outline">
                  <Link to="/account">Account Page</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/belastingprofiel">Tax Profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/login">Login Page</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}