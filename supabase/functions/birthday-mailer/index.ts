import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const resend = new Resend(resendApiKey);

    const today = new Date();
    // getMonth() is 0-indexed (0=Jan), so we add 1
    const month = today.getMonth() + 1;
    const day = today.getDate();

    console.log(`Checking birthdays for month: ${month}, day: ${day}`);

    // 🎯 find today's birthdays
    const { data: users, error } = await supabase
      .from("users")
      .select("email, username")
      .eq("birth_month", month)
      .eq("birth_day", day);

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    if (!users || users.length === 0) {
      console.log("No birthdays found today.");
      return new Response(JSON.stringify({ message: "No birthdays today 🎂" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log(`Found ${users.length} users with birthdays today.`);

    // ✉️ send emails
    const results = [];
    for (const user of users) {
      try {
        const data = await resend.emails.send({
          from: "Campus Paws <birthday@campuspaws.in>",
          to: user.email,
          subject: "Happy Birthday from Campus Paws 🐾🎂",
          html: `
            <div style="font-family:Arial;padding:24px;max-width:600px;margin:0 auto;color:#333;">
              <h2 style="color:#7a5c45;">Happy Birthday ${user.username || 'Friend'}! 🎉</h2>

              <p>The Campus Paws family wishes you a pawsome year ahead 🐶</p>

              <p>
              Celebrate your day by feeding our campus dogs ❤️
              </p>

              <div style="margin-top:24px;margin-bottom:24px;">
                <a href="https://campuspaws.in/community"
                   style="background:#7a5c45;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">
                   Celebrate with Dogs 🐾
                </a>
              </div>

              <p style="margin-top:30px;font-size:14px;color:#666;">
              — Campus Paws Team
              </p>
            </div>
          `
        });
        results.push({ email: user.email, status: 'sent', id: data.id });
        // Small delay to be nice to API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err: any) {
        console.error(`Failed to send to ${user.email}:`, err);
        results.push({ email: user.email, status: 'failed', error: err.message });
      }
    }

    return new Response(JSON.stringify({
      message: `Processed ${users.length} birthdays`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
