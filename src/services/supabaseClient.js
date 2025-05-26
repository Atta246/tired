import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajcltqyqbspwqvkaewvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2x0cXlxYnNwd3F2a2Fld3Z0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzM1MzU2NSwiZXhwIjoyMDYyOTI5NTY1fQ.0Co9lI7AWR9FECl7pSk_GT3KikktI2rkPTUx5kJNqpA';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to initialize database tables
export const initializeDatabase = async () => {
  try {
    // Initialize orders table
    const response = await fetch('/api/admin/setup/orders-table', {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to initialize database:', errorData.error);
      return false;
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export default supabase;
