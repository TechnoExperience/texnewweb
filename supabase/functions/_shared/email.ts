// Email utility for Edge Functions
// Supports Resend, SendGrid, or Supabase Email (if available)

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, from = 'noreply@technoexperience.com' } = options

  // Try Resend first (recommended)
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Email sent via Resend:', data.id)
        return { success: true }
      } else {
        const error = await response.text()
        console.error('Resend error:', error)
      }
    } catch (error) {
      console.error('Resend API error:', error)
    }
  }

  // Fallback: Try SendGrid
  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
  if (sendgridApiKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      })

      if (response.ok) {
        console.log('Email sent via SendGrid')
        return { success: true }
      } else {
        const error = await response.text()
        console.error('SendGrid error:', error)
      }
    } catch (error) {
      console.error('SendGrid API error:', error)
    }
  }

  // Fallback: Log email (for development)
  console.log('=== EMAIL (Development Mode) ===')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('HTML:', html)
  console.log('===============================')

  return { success: true }
}

export function generateOrderConfirmationEmail(order: any, orderItems: any[]): { subject: string; html: string } {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name || 'Producto'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.21 // IVA 21%
  const total = subtotal + tax

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00F9FF 0%, #00D9E6 100%); color: #000; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">TECHNO EXPERIENCE</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Confirmación de Pedido</p>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Gracias por tu pedido. Tu compra ha sido confirmada y está siendo procesada.</p>
          
          <div class="order-info">
            <h2 style="margin-top: 0;">Detalles del Pedido</h2>
            <p><strong>Número de Pedido:</strong> ${order.order_number}</p>
            <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Estado:</strong> ${order.status === 'paid' ? 'Pagado' : 'Pendiente'}</p>
          </div>

          <h3>Productos</h3>
          <table>
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Producto</th>
                <th style="padding: 10px; text-align: center;">Cantidad</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total">
            <p>Subtotal: €${subtotal.toFixed(2)}</p>
            <p>IVA (21%): €${tax.toFixed(2)}</p>
            <p style="font-size: 24px; color: #00F9FF;">Total: €${total.toFixed(2)}</p>
          </div>

          <div class="order-info">
            <h3 style="margin-top: 0;">Dirección de Envío</h3>
            <p>${order.shipping_name || ''}<br>
            ${order.shipping_address || ''}<br>
            ${order.shipping_city || ''}, ${order.shipping_postal_code || ''}<br>
            ${order.shipping_country || ''}</p>
          </div>

          <p>Recibirás un email de confirmación cuando tu pedido sea enviado.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <div class="footer">
          <p>TECHNO EXPERIENCE - Merchandising Oficial</p>
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `Confirmación de Pedido #${order.order_number} - TECHNO EXPERIENCE`,
    html,
  }
}

