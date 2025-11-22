import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
  cart_items: any[];
  coupon_id?: string;
  discount_amount?: number;
  save_address?: boolean;
  address_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!razorpayKeySecret || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Server configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      cart_items,
      coupon_id,
      discount_amount,
      save_address,
      address_data,
    }: VerifyPaymentRequest = await req.json();

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });

    // Verify signature
    const generatedSignature = createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment signature verified successfully');

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User authentication failed');
    }

    // Update order status to confirmed
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'confirmed',
      })
      .eq('id', order_id)
      .eq('user_id', user.id);

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cart_items.map(item => ({
      order_id: order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.discount_price || item.products?.["MRP (INR)"] || 0,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product stock quantities
    for (const item of cart_items) {
      const product = item.products;
      if (!product) continue;

      const currentStock = product.QTY || 0;
      const newStock = currentStock - item.quantity;

      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${product["Material Desc"]}`);
      }

      const { error: stockError } = await supabase
        .from('products')
        .update({ QTY: newStock })
        .eq('id', item.product_id);

      if (stockError) throw stockError;
    }

    // Save address if requested
    if (save_address && address_data) {
      try {
        const { data: existingAddresses } = await supabase
          .from('saved_addresses')
          .select('id')
          .eq('user_id', user.id);

        await supabase.from('saved_addresses').insert({
          user_id: user.id,
          name: address_data.fullName,
          email: address_data.email,
          phone: address_data.phone,
          address: address_data.address,
          city: address_data.city,
          state: address_data.state,
          zip_code: address_data.pincode,
          is_default: !existingAddresses || existingAddresses.length === 0
        });
      } catch (error) {
        console.error('Failed to save address:', error);
      }
    }

    // Update coupon usage if applied
    if (coupon_id && discount_amount) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('current_uses')
        .eq('id', coupon_id)
        .single();

      if (coupon) {
        await supabase
          .from('coupons')
          .update({ current_uses: coupon.current_uses + 1 })
          .eq('id', coupon_id);

        await supabase.from('coupon_usage').insert({
          coupon_id: coupon_id,
          user_id: user.id,
          order_id: order_id,
          discount_amount: discount_amount
        });
      }
    }

    // Clear user's cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    console.log('Payment verified and order completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment verified successfully',
        order_id: order_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in razorpay-verify-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
