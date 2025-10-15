import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";

export default function AccountDebug() {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Account Debug</h1>
          
          <div className="space-y-4 bg-gray-100 p-4 rounded">
            <div>
              <strong>Auth Loading:</strong> {authLoading ? 'true' : 'false'}
            </div>
            <div>
              <strong>User exists:</strong> {user ? 'true' : 'false'}
            </div>
            <div>
              <strong>User email:</strong> {user?.email ? 'taxi@frades.be' : 'None'}
            </div>
            <div>
              <strong>User ID:</strong> {user?.id || 'None'}
            </div>
          </div>
          
          {!authLoading && !user && (
            <div className="mt-4 p-4 bg-red-100 rounded">
              <p>No user detected - should redirect to login</p>
            </div>
          )}
          
          {!authLoading && user && (
            <div className="mt-4 p-4 bg-green-100 rounded">
              <p>User is logged in - should show account page</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}