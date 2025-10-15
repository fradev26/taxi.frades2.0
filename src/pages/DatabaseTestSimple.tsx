import React from 'react';
import { supabase } from "@/integrations/supabase/client";

export default function DatabaseTestSimple() {
  const testDatabase = async () => {
    try {
      console.log('Starting database test...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No user found:', userError);
        alert('Please login first');
        return;
      }
      
      console.log('User found:', user.id);
      
      // Test SELECT
      console.log('Testing SELECT from users...');
      const { data: selectData, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (selectError) {
        console.error('SELECT error:', selectError);
        alert(`SELECT failed: ${selectError.message}`);
        return;
      }
      
      if (selectData) {
        console.log('Profile exists:', selectData);
        alert('Profile found! Testing UPDATE...');
        
        // Test UPDATE
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ 
            first_name: 'Test ' + Date.now(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('UPDATE error:', updateError);
          alert(`UPDATE failed: ${updateError.message}`);
        } else {
          console.log('UPDATE success:', updateData);
          alert('UPDATE successful! Check console for details.');
        }
      } else {
        console.log('No profile found, testing INSERT...');
        alert('No profile found! Testing INSERT...');
        
        // Test INSERT into users table (not profiles!)
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            first_name: 'Test User'
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('INSERT error:', insertError);
          alert(`INSERT failed: ${insertError.message}`);
        } else {
          console.log('INSERT success:', insertData);
          alert('INSERT successful! Check console for details.');
        }
      }
      
    } catch (error) {
      console.error('Test failed:', error);
      alert(`Test failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Test</h1>
        
        <div className="space-y-4">
          <button 
            onClick={testDatabase}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Run Database Test
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Make sure you are logged in</li>
            <li>Click "Run Database Test" button</li>
            <li>Check alerts for results</li>
            <li>Open browser console (F12) for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}