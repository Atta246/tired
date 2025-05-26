import { NextResponse } from 'next/server';
import { supabase } from '../../../../../services/supabaseClient';

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { status } = body;

    // Validate required fields
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order status updated successfully', 
      order: data[0] 
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
