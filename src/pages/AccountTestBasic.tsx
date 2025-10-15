import React from 'react';
import { useAuth } from "@/hooks/useAuth";

export default function AccountSimpleTest() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading auth...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Account Test</h1>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Created:</strong> {user.created_at}</p>
        <p><strong>Metadata:</strong> {JSON.stringify(user.user_metadata, null, 2)}</p>
      </div>
    </div>
  );
}