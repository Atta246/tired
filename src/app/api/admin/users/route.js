import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client with the service role key
    // This code runs on the server so it's safe to use the service role key
    const supabaseAdmin = createClient(
      "https://ajcltqyqbspwqvkaewvt.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2x0cXlxYnNwd3F2a2Fld3Z0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzM1MzU2NSwiZXhwIjoyMDYyOTI5NTY1fQ.0Co9lI7AWR9FECl7pSk_GT3KikktI2rkPTUx5kJNqpA"
    );

    // Fetch users using the admin API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data.users });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}
