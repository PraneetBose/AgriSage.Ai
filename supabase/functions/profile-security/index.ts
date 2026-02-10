import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`[AgriSathi] ${req.method} request starting...`);
        console.log("Checking Environment Secrets...");
        console.log("- RESEND_API_KEY:", RESEND_API_KEY ? "EXISTS" : "MISSING");
        console.log("- SUPABASE_URL:", SUPABASE_URL ? "EXISTS" : "MISSING");
        console.log("- SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "EXISTS" : "MISSING");

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        const url = new URL(req.url)
        const actionParam = url.searchParams.get('action')
        const tokenParam = url.searchParams.get('token')

        console.log(`[AgriSathi] ${req.method} request received`);

        // 1. Handle GET requests (Email Confirmation)
        if (req.method === 'GET') {
            if (actionParam === 'confirm' && tokenParam) {
                const { data: pending, error: findError } = await supabase
                    .from('pending_password_changes')
                    .select('*')
                    .eq('token', tokenParam)
                    .gt('expires_at', new Date().toISOString())
                    .single()

                if (findError || !pending) {
                    return new Response('Invalid or expired approval link. Please request a new password change.', {
                        status: 400,
                        headers: { 'Content-Type': 'text/plain' }
                    })
                }

                // Update Auth Password
                const { data: users } = await supabase.auth.admin.listUsers()
                const targetUser = users.users.find(u => u.email === pending.email)
                if (!targetUser) throw new Error("User not found.")

                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    targetUser.id,
                    { password: pending.new_password }
                )
                if (updateError) throw updateError

                // Cleanup
                await supabase.from('pending_password_changes').delete().eq('id', pending.id)

                return new Response(`
                    <html>
                       <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #050505; color: #eee; margin: 0;">
                         <div style="background: #0a0a0a; padding: 50px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; max-width: 400px; border: 1px solid #1a1a1a;">
                           <h1 style="color: #D4AF37;">Success!</h1>
                           <p>Your password has been changed successfully.</p>
                           <p>You can now log in with your new password.</p>
                           <br>
                           <a href="https://agrisathi.app" style="background: #D4AF37; color: black; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Return to Dashboard</a>
                         </div>
                       </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } })
            }
            return new Response('Invalid request', { status: 400 })
        }

        // 2. Handle POST requests (Password Change Request)
        if (req.method === 'POST') {
            const body = await req.json()
            const { action, email, new_password } = body

            if (action === 'request_password_change') {
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
                const verificationToken = crypto.randomUUID()

                // Store pending change
                const { error: dbError } = await supabase.from('pending_password_changes').insert({
                    email,
                    new_password,
                    token: verificationToken,
                    expires_at: expiresAt
                })

                if (dbError) throw dbError

                const approvalUrl = `https://${new URL(SUPABASE_URL!).hostname}/functions/v1/profile-security?action=confirm&token=${verificationToken}`

                // Send via Resend
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: 'AgriSage.ai <onboarding@resend.dev>',
                        to: [email],
                        subject: 'Approve Password Change - AgriSage.ai',
                        html: `<div style="font-family: sans-serif; padding: 40px; border: 1px solid #e0e0e0; border-radius: 15px; max-width: 500px; margin: auto; background: #fff;">
                          <h2 style="color: #2e7d32; text-align: center; margin-bottom: 30px;">AgriSage.ai Security</h2>
                          <p>You requested a password change for your <strong>AgriSage.ai</strong> account. Click the button below to approve and finalize this change.</p>
                          <div style="text-align: center; margin: 40px 0;">
                            <a href="${approvalUrl}" style="background-color: #2e7d32; color: white; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Confirm Password Change</a>
                          </div>
                          <p style="font-size: 0.9rem; color: #888;">This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
                          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                          <p style="font-size:12px; color:#999;">AgriSage.ai - Intelligence for your Farm</p>
                        </div>`,
                    }),
                })

                if (!res.ok) throw new Error('Resend API failure')

                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        throw new Error('Action or method not supported')

    } catch (error) {
        console.error(`[AgriSathi Error] ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
