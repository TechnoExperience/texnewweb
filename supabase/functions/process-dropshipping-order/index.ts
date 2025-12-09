// Supabase Edge Function: Process Dropshipping Order
// Procesa pedidos de dropshipping y redirige al proveedor

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
      Deno.env.get('SUPABASE_PROJECT_URL') || 
      'https://cfgfshoobuvycrbhnvkd.supabase.co'
    
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
      Deno.env.get('SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { orderId, productId, quantity, customerData } = await req.json()

    if (!orderId || !productId) {
      return new Response(
        JSON.stringify({ error: 'orderId y productId son requeridos' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Obtener información del producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    if (!product.dropshipping_enabled || !product.dropshipping_url) {
      return new Response(
        JSON.stringify({ error: 'Este producto no tiene dropshipping habilitado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Crear registro de dropshipping order
    const { data: dropshippingOrder, error: dropshippingError } = await supabase
      .from('dropshipping_orders')
      .insert({
        order_id: orderId,
        product_id: productId,
        supplier_name: product.dropshipping_supplier_name || 'Proveedor desconocido',
        supplier_url: product.dropshipping_url,
        supplier_status: 'pending',
        metadata: {
          customer_data: customerData,
          quantity,
          product_name: product.name,
        }
      })
      .select()
      .single()

    if (dropshippingError) {
      console.error('Error creando dropshipping order:', dropshippingError)
      return new Response(
        JSON.stringify({ error: 'Error al crear pedido de dropshipping' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Retornar URL del proveedor para redirección
    return new Response(
      JSON.stringify({
        success: true,
        dropshipping_order_id: dropshippingOrder.id,
        supplier_url: product.dropshipping_url,
        redirect_url: product.dropshipping_url, // URL para redirigir al cliente
        supplier_name: product.dropshipping_supplier_name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error fatal:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

