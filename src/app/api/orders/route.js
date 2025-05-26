import { NextResponse } from 'next/server';
import { supabase } from '../../../services/supabaseClient';

export async function GET() {
  try {
    // Fetch all orders with user information
    const { data: orders, error } = await supabase
      .from('online_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Fetched orders:', orders);

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, totalAmount } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    // Insert order into database
    const { data: orderData, error: orderError } = await supabase
      .from('online_orders')
      .insert({
        items: items,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select();

    if (orderError) {
      console.error('Error creating order:', orderError);
      console.error('Request body:', body);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order created successfully', 
      order: orderData[0] 
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
