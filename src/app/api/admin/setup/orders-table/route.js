import { NextResponse } from 'next/server';
import { supabase } from '../../../services/supabaseClient';

export async function POST() {
  try {
    // Create orders table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('create_orders_table_if_not_exists');

    if (createTableError) {
      console.error('Error creating orders table:', createTableError);
      return NextResponse.json({ error: createTableError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Orders table created successfully' });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Failed to create orders table' }, { status: 500 });
  }
}
