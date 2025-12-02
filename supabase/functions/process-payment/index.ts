// Edge Function: Process Payment with BBVA/Redsys
// Generates payment signature and redirects to Redsys TPV

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CryptoJS from 'https://esm.sh/crypto-js@4.2.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  order_id: string
  amount: number
  currency: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Redsys configuration
    const merchantCode = Deno.env.get('REDSYS_MERCHANT_CODE') || ''
    const terminal = Deno.env.get('REDSYS_TERMINAL') || '001'
    const secretKey = Deno.env.get('REDSYS_SECRET_KEY') || ''
    const environment = Deno.env.get('REDSYS_ENVIRONMENT') || 'test'
    
    const redsysUrl = environment === 'production'
      ? 'https://sis.redsys.es/sis/realizarPago'
      : 'https://sis-t.redsys.es:25443/sis/realizarPago'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request
    const { order_id, amount, currency }: PaymentRequest = await req.json()

    if (!order_id || !amount) {
      throw new Error('Missing required fields: order_id and amount')
    }

    // Get order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Generate Ds_Merchant_Order (order number for Redsys)
    // Format: YYYYMMDDHHmmss + random 4 digits
    const now = new Date()
    const orderNumber = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    // Amount in cents (Redsys format)
    const amountInCents = Math.round(amount * 100)

    // Build Ds_MerchantParameters (JSON)
    const merchantParameters = {
      Ds_Merchant_Amount: amountInCents.toString(),
      Ds_Merchant_Order: orderNumber,
      Ds_Merchant_MerchantCode: merchantCode,
      Ds_Merchant_Currency: currency === 'EUR' ? '978' : '840', // 978 = EUR, 840 = USD
      Ds_Merchant_TransactionType: '0', // Authorization
      Ds_Merchant_Terminal: terminal,
      Ds_Merchant_MerchantURL: `${supabaseUrl.replace('/rest/v1', '')}/functions/v1/payment-callback`,
      Ds_Merchant_UrlOK: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/checkout/success?order_id=${order_id}`,
      Ds_Merchant_UrlKO: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/checkout/error?order_id=${order_id}`,
    }

    // Encode parameters to Base64
    const parametersJson = JSON.stringify(merchantParameters)
    const parametersBase64 = btoa(unescape(encodeURIComponent(parametersJson)))

    // Generate signature
    // HMAC SHA256 with secret key
    const signature = CryptoJS.HmacSHA256(parametersBase64, secretKey)
    const signatureBase64 = CryptoJS.enc.Base64.stringify(signature)

    // Update order with payment reference
    await supabase
      .from('orders')
      .update({
        payment_reference: orderNumber,
        payment_status: 'pending',
        metadata: {
          ...order.metadata,
          redsys_order: orderNumber,
          redsys_parameters: parametersBase64,
        },
      })
      .eq('id', order_id)

    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: redsysUrl,
        parameters: parametersBase64,
        signature: signatureBase64,
        merchant_code: merchantCode,
        terminal: terminal,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error processing payment',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

