import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const token = authHeader.replace("Bearer ", "");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) throw new Error("Invalid user");

    // Admin DB client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { title, content } = await req.json();

    // Create announcement
    const { data: announcement } = await supabaseAdmin
      .from("announcements")
      .insert({
        title,
        content,
        created_by: user.id
      })
      .select()
      .single();

    // Get active users from Auth (Source of Truth for Emails)
    // We filter for confirmed emails and non-banned users
    const { data: authData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (authUsersError) throw authUsersError;

    const users = authData.users.filter(u => u.email_confirmed_at && !u.banned_until);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No verified users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Helper for rate limiting
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Send emails (Rate limited: ~1.6 emails/sec)
    for (const u of users) {
      try {
        await resend.emails.send({
          from: "Campus Paws <noreply@campuspaws.in>",
          to: u.email,
          subject: title,
          html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:30px 0;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" 
        style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6b4f3b,#8b6a50);padding:26px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:24px;">� Campus Paws</h1>
              <p style="margin:6px 0 0 0;font-size:13px;opacity:0.9;">Community Animal Care Network</p>
            </td>
          </tr>

          <!-- Announcement Badge -->
          <tr>
            <td style="padding:24px 30px 10px 30px;text-align:center;">
              <span style="background:#fff3cd;color:#856404;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:bold;">
                📢 NEW ANNOUNCEMENT
              </span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:10px 40px 0 40px;text-align:center;">
              <h2 style="margin:0;color:#222;font-size:22px;">
                ${title}
              </h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:18px 40px 20px 40px;color:#444;font-size:15px;line-height:1.7;text-align:center;">
              ${content.replace(/\n/g, "<br/>")}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #eee;">
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:26px;">
              <a href="https://campuspaws.in"
              style="background:#6b4f3b;color:white;padding:12px 26px;border-radius:8px;
              text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
                Open Campus Paws
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:22px;text-align:center;font-size:12px;color:#888;">
              <p style="margin:0;">You're receiving this because you're a registered member of Campus Paws.</p>
              <p style="margin:8px 0 0 0;">
                Made with 🐶❤️ for campus animals
              </p>
            </td>
          </tr>

        </table>

        <!-- Bottom spacing -->
        <div style="height:20px"></div>

      </td>
    </tr>
  </table>

</body>
</html>
          `,
        });
        // Respect Resend limit (2req/sec)
        await sleep(600);
      } catch (emailErr) {
        console.error(`Failed to send email to ${u.email}:`, emailErr);
        // Continue to next user even if one fails
      }
    }

    return new Response(JSON.stringify({ success: true, sent: users.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});