// Edge Function: Payment Callback Handler
// Receives response from BBVA/Redsys and updates order status

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CryptoJS from 'https://esm.sh/crypto-js@4.2.0'
import { sendEmail, generateOrderConfirmationEmail } from '../_shared/email.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CallbackRequest {
  Ds_SignatureVersion?: string
  Ds_Signature?: string
  Ds_MerchantParameters?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const secretKey = Deno.env.get('REDSYS_SECRET_KEY') || ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request (can be GET or POST from Redsys)
    let callbackData: CallbackRequest = {}
    
    if (req.method === 'POST') {
      callbackData = await req.json()
    } else {
      // GET request - parse from URL params
      const url = new URL(req.url)
      callbackData = {
        Ds_SignatureVersion: url.searchParams.get('Ds_SignatureVersion') || undefined,
        Ds_Signature: url.searchParams.get('Ds_Signature') || undefined,
        Ds_MerchantParameters: url.searchParams.get('Ds_MerchantParameters') || undefined,
      }
    }

    const { Ds_MerchantParameters, Ds_Signature } = callbackData

    if (!Ds_MerchantParameters || !Ds_Signature) {
      throw new Error('Missing required parameters from Redsys')
    }

    // Verify signature
    const calculatedSignature = CryptoJS.HmacSHA256(Ds_MerchantParameters, secretKey)
    const calculatedSignatureBase64 = CryptoJS.enc.Base64.stringify(calculatedSignature)

    if (calculatedSignatureBase64 !== Ds_Signature) {
      throw new Error('Invalid signature from Redsys')
    }

    // Decode parameters
    const parametersJson = decodeURIComponent(atob(Ds_MerchantParameters))
    const parameters = JSON.parse(parametersJson)

    const {
      Ds_Order: orderNumber,
      Ds_Response: responseCode,
      Ds_Amount: amount,
      Ds_Currency: currency,
      Ds_MerchantCode: merchantCode,
    } = parameters

    // Response codes: 0000-0099 = Success, others = Error
    const isSuccess = parseInt(responseCode) >= 0 && parseInt(responseCode) <= 99

    // Find order by payment_reference
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_reference', orderNumber)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Update order status
    const updateData: any = {
      payment_status: isSuccess ? 'paid' : 'failed',
      status: isSuccess ? 'paid' : 'pending',
      metadata: {
        ...order.metadata,
        redsys_response: responseCode,
        redsys_amount: amount,
        redsys_currency: currency,
        callback_received_at: new Date().toISOString(),
      },
    }

    if (isSuccess) {
      updateData.payment_gateway = 'redsys'
      updateData.payment_method = 'card'
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (updateError) {
      throw updateError
    }

    // Send email notification if payment successful
    if (isSuccess && order.email) {
      try {
        // Fetch order items for email
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*, products(name)')
          .eq('order_id', order.id)

        const itemsWithNames = (orderItems || []).map(item => ({
          ...item,
          product_name: (item.products as any)?.name || 'Producto',
        }))

        const { subject, html } = generateOrderConfirmationEmail(order, itemsWithNames)
        
        await sendEmail({
          to: order.email,
          subject,
          html,
        })

        console.log(`Confirmation email sent for order ${order.order_number} to ${order.email}`)
      } catch (emailError) {
        // Don't fail the callback if email fails
        console.error('Error sending confirmation email:', emailError)
      }
    }

    // Return response to Redsys (required)
    return new Response(
      JSON.stringify({
        success: isSuccess,
        order_id: order.id,
        order_number: order.order_number,
        status: isSuccess ? 'paid' : 'failed',
        response_code: responseCode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Payment callback error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error processing callback',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

