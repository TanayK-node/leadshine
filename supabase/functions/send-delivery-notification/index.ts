import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliveryNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  productNames: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderNumber, productNames }: DeliveryNotificationRequest = await req.json();

    console.log("Sending delivery notification to:", customerEmail);

    const productList = productNames.join(", ");

    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          name: "Leadshine Marketing",
          email: "leadshinemarketing@gmail.com",
        },
        to: [
          {
            email: customerEmail,
            name: customerName,
          },
        ],
        subject: `Your Order ${orderNumber} is Out for Delivery!`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .order-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚚 Your Order is Out for Delivery!</h1>
                </div>
                <div class="content">
                  <p>Dear ${customerName},</p>
                  
                  <p>Great news! Your order is now out for delivery and will reach you in the next 3-4 working days.</p>
                  
                  <div class="order-info">
                    <h3>Order Details:</h3>
                    <p><strong>Order Number:</strong> ${orderNumber}</p>
                    <p><strong>Products:</strong> ${productList}</p>
                  </div>
                  
                  <p>Our delivery partner will contact you shortly to schedule the delivery at your convenience.</p>
                  
                  <p>Thank you for shopping with us! We hope you enjoy your purchase.</p>
                  
                  <p>If you have any questions or concerns, please don't hesitate to contact our customer support team.</p>
                </div>
                <div class="footer">
                  <p>Best regards,<br>The Leadshine Marketing Team</p>
                  <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Brevo API error:", errorData);
      throw new Error(`Brevo API error: ${emailResponse.status} - ${errorData}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-delivery-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
