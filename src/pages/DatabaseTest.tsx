import { supabase } from "@/integrations/supabase/client";

export default function DatabaseTest() {
  const testInsert = async () => {
    try {
      // Test if we can insert into profiles table
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user logged in');
        alert('No user logged in - please login first');
        return;
      }

      console.log('Testing INSERT into profiles table for user:', user.id);
      
      // First check if profile already exists
      const { data: existing } = await supabase
  .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (existing) {
        console.log('Profile already exists, testing UPDATE instead');
        alert('Profile already exists for this user - testing UPDATE instead');
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ first_name: 'Updated Test' })
          .eq('id', user.id)
          .select()
          .single();
          
        if (error) {
          console.error('UPDATE failed:', error);
          alert(`UPDATE failed: ${error.message}`);
          return { success: false, error: error.message };
        } else {
          console.log('UPDATE succeeded:', data);
          alert('UPDATE succeeded! Check console for details.');
          return { success: true, data };
        }
      } else {
        // Try INSERT
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: 'Test',
            last_name: 'User'
          })
          .select()
          .single();

        if (error) {
          console.error('INSERT failed:', error);
          alert(`INSERT failed: ${error.message}`);
          return { success: false, error: error.message };
        } else {
          console.log('INSERT succeeded:', data);
          alert('INSERT succeeded! Check console for details.');
          return { success: true, data };
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  const testPolicies = async () => {
    try {
      console.log('Testing database connection...');
      
      // Test basic database connectivity by trying to select from users
      const { data, error } = await supabase
  .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Database connection failed:', error);
        alert(`Database connection failed: ${error.message}`);
        return { success: false, error: error.message };
      } else {
        console.log('Database connection successful');
        alert('Database connection successful - check console for details');
        return { success: true, data };
      }
    } catch (err) {
      console.error('Database test error:', err);
      alert(`Database test error: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  const testBasicProfile = async () => {
    try {
      console.log('Testing basic profile operations...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please login first');
        return;
      }
      
      // Test SELECT
      console.log('Testing SELECT...');
      const { data: selectData, error: selectError } = await supabase
  .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (selectError) {
        console.error('SELECT failed:', selectError);
        alert(`SELECT failed: ${selectError.message}`);
        return;
      }
      
      console.log('SELECT succeeded:', selectData);
      
      // Test UPDATE if profile exists
      if (selectData) {
        console.log('Testing UPDATE...');
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ first_name: 'Test Update ' + new Date().getTime() })
          .eq('id', user.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('UPDATE failed:', updateError);
          alert(`UPDATE failed: ${updateError.message}`);
        } else {
          console.log('UPDATE succeeded:', updateData);
          alert('Profile operations successful! Check console for details.');
        }
      }
      
    } catch (err) {
      console.error('Profile test error:', err);
      alert(`Profile test error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Policy Test</h1>
        
        <div className="space-y-4">
          <button 
            onClick={testInsert}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Profile INSERT
          </button>
          
          <button 
            onClick={testPolicies}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
          >
            Test Database Connection
          </button>
          
          <button 
            onClick={testBasicProfile}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-4"
          >
            Test Profile Operations
          </button>
        </div>
        
        <div className="mt-8 bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-600">
            Open browser console (F12) to see test results.
          </p>
        </div>
      </div>
    </div>
  );
}