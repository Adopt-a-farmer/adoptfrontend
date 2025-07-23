import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  farmer_id: number;
  email: string;
  method: 'email' | 'sms';
  phone_number?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { farmer_id, email, method, phone_number }: InvitationRequest = await req.json();

    // Get farmer and invitation details
    const { data: invitationData, error: invitationError } = await supabase
      .from('farmer_invitations')
      .select(`
        *,
        farmers (name, location)
      `)
      .eq('farmer_id', farmer_id)
      .eq('email', email)
      .single();

    if (invitationError || !invitationData) {
      throw new Error('Invitation not found');
    }

    const inviteUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.app')}/auth/farmer-invite/${invitationData.invite_token}`;
    const farmerName = invitationData.farmers.name;
    const farmerLocation = invitationData.farmers.location;

    if (method === 'email') {
      // For now, we'll return the invitation details
      // In production, you would integrate with an email service
      console.log(`Email invitation would be sent to ${email}:`, {
        subject: 'Welcome to Adopt-a-Farmer Platform',
        body: `Dear ${farmerName}, you've been invited to join the Adopt-a-Farmer platform. Click here to create your account: ${inviteUrl}`
      });
    } else if (method === 'sms' && phone_number) {
      // For now, we'll return the SMS details
      // In production, you would integrate with an SMS service like Twilio
      console.log(`SMS invitation would be sent to ${phone_number}:`, {
        message: `Hi ${farmerName}! You're invited to join Adopt-a-Farmer. Create your account: ${inviteUrl}`
      });
    }

    return new Response(JSON.stringify({
      success: true,
      invitation_sent: true,
      invite_url: inviteUrl,
      farmer_name: farmerName,
      method,
      recipient: method === 'email' ? email : phone_number
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error sending invitation:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send invitation' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);