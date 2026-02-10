import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Note: You need to set the RESEND_API_KEY in your Supabase Project Settings > Edge Functions > Secrets
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            }
        });
    }

    try {
        const { email, timestamp } = await req.json();

        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set in Supabase Secrets.");
            return new Response(JSON.stringify({ error: "Notification service not configured (API Key missing)." }), {
                status: 500,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        // Sending email via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'AgriSage.ai <onboarding@resend.dev>', // Replace with your verified domain in production
                to: [email], // Assuming 'email' from req.json() is the user's email
                subject: 'Security Alert: New Login to AgriSage.ai',
                html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto; background: #fafafa;">
            <h2 style="color: #2e7d32;">🔐 New Login Notification</h2>
            <p>Hi there,</p>
            <p>A new login was detected on your <strong>AgriSage.ai</strong> account at <strong>${timestamp}</strong>.</p>
            <p>This is a standard security notification to keep your farm data safe.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
            <p style="font-size: 0.9rem; color: #666;">If this was you, you can safely ignore this email.<br/>
            If you do not recognize this activity, please change your password immediately.</p>
            <p style="margin-top: 30px;">Happy Farming,<br/><strong>AgriSage Team</strong></p>
          </div>
        `,
            }),
        });

        const resData = await res.json();

        return new Response(JSON.stringify({ success: true, data: resData }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });

    } catch (error) {
        console.error("Error sending notification:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
});
