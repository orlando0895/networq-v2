import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MutualContactRequest {
  otherUserContactCard: {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
    services?: string[];
    linkedin?: string;
    facebook?: string;
    whatsapp?: string;
    websites?: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 EDGE FUNCTION: add-mutual-contact started');
  console.log('📋 Request method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    console.log('✅ Admin client created');

    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ error: 'No authorization header', success: false }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Invalid token:', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid token', success: false }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ User authenticated:', user.id);

    const { otherUserContactCard }: MutualContactRequest = await req.json();
    console.log('📥 Received payload:', { 
      targetUserId: otherUserContactCard.user_id, 
      targetName: otherUserContactCard.name 
    });

    // Step 1: Get current user's contact card
    console.log('📋 Getting current user contact card...');
    const { data: myContactCard, error: myCardError } = await supabaseAdmin
      .from('user_contact_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (myCardError || !myContactCard) {
      console.error('❌ Error fetching user contact card:', myCardError);
      return new Response(JSON.stringify({ 
        error: 'User contact card not found',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Current user contact card found:', myContactCard.name);

    // Step 2: Check if contact already exists in their list
    console.log('🔍 Checking if contact already exists...');
    const { data: existingContact, error: checkError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('user_id', otherUserContactCard.user_id)
      .eq('email', myContactCard.email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing contact:', checkError);
      return new Response(JSON.stringify({ 
        error: 'Database error while checking existing contact',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (existingContact) {
      console.log('ℹ️ Contact already exists in their list');
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Contact already exists in their list'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 3: Add current user to their contact list (using admin privileges)
    console.log('📝 Adding current user to their contact list...');
    const { error: addToTheirListError } = await supabaseAdmin
      .from('contacts')
      .insert({
        user_id: otherUserContactCard.user_id,
        name: myContactCard.name,
        email: myContactCard.email,
        phone: myContactCard.phone,
        company: myContactCard.company,
        industry: myContactCard.industry,
        services: myContactCard.services,
        tier: 'Acquaintance',
        notes: 'Added via mutual contact',
        linkedin: myContactCard.linkedin,
        facebook: myContactCard.facebook,
        whatsapp: myContactCard.whatsapp,
        websites: myContactCard.websites,
        added_date: new Date().toISOString().split('T')[0],
        added_via: 'mutual_contact'
      });

    if (addToTheirListError) {
      console.error('❌ Error adding to their contacts:', addToTheirListError);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Failed to add contact: ${addToTheirListError.message}`,
        details: addToTheirListError
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Successfully added to their contact list');
    console.log('🏁 EDGE FUNCTION: Mutual contact addition completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Mutual contact addition completed successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('💥 EDGE FUNCTION: Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: `Unexpected error: ${error.message}`,
      success: false,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);