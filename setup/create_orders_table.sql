-- Create a function to set up the orders table if it doesn't exist
CREATE OR REPLACE FUNCTION create_orders_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the orders table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    -- Create the orders table
    CREATE TABLE public.orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      items JSONB NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      shipping_info JSONB,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

    -- Policy to allow authenticated users to see only their own orders
    CREATE POLICY "Users can view their own orders" 
      ON public.orders 
      FOR SELECT 
      TO authenticated 
      USING (auth.uid() = user_id);

    -- Policy to allow users to insert their own orders
    CREATE POLICY "Users can insert their own orders" 
      ON public.orders 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = user_id);

    -- Policy to allow service role to do everything
    CREATE POLICY "Service role can do everything" 
      ON public.orders 
      FOR ALL 
      TO service_role 
      USING (true) 
      WITH CHECK (true);

    -- Create trigger for updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
    
    -- Create index for faster queries
    CREATE INDEX orders_user_id_idx ON public.orders(user_id);
    CREATE INDEX orders_status_idx ON public.orders(status);
    CREATE INDEX orders_created_at_idx ON public.orders(created_at);
  END IF;
END;
$$;
