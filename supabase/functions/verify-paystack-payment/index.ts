import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();
    
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) throw new Error("Paystack secret key not configured");

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
      },
    });

    const verificationData = await response.json();
    
    if (!verificationData.status) {
      throw new Error("Payment verification failed");
    }

    const { data: payment } = verificationData;
    
    if (payment.status === "success") {
      // Update payment status and create adoption record
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Update payment status
      await supabaseService
        .from("payments")
        .update({ 
          status: "completed",
          currency: payment.currency 
        })
        .eq("user_id", payment.metadata.user_id)
        .eq("farmer_id", payment.metadata.farmer_id);

      // Create or update farmer adoption
      const { data: existingAdoption } = await supabaseService
        .from("farmer_adoptions")
        .select("*")
        .eq("adopter_id", payment.metadata.user_id)
        .eq("farmer_id", payment.metadata.farmer_id)
        .single();

      if (existingAdoption) {
        // Update existing adoption
        await supabaseService
          .from("farmer_adoptions")
          .update({
            total_contributed: existingAdoption.total_contributed + (payment.amount / 100),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAdoption.id);
      } else {
        // Create new adoption
        await supabaseService.from("farmer_adoptions").insert({
          adopter_id: payment.metadata.user_id,
          farmer_id: payment.metadata.farmer_id,
          monthly_contribution: payment.amount / 100,
          total_contributed: payment.amount / 100,
          status: "active",
        });
      }

      // Update farmer's funding raised
      const { data: farmer } = await supabaseService
        .from("farmers")
        .select("fundingraised, supporters")
        .eq("id", payment.metadata.farmer_id)
        .single();

      if (farmer) {
        await supabaseService
          .from("farmers")
          .update({
            fundingraised: farmer.fundingraised + (payment.amount / 100),
            supporters: existingAdoption ? farmer.supporters : farmer.supporters + 1,
          })
          .eq("id", payment.metadata.farmer_id);
      }
    }

    return new Response(JSON.stringify({
      success: payment.status === "success",
      status: payment.status,
      amount: payment.amount / 100,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});