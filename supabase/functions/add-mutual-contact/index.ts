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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for elevated privileges
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

    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { otherUserContactCard }: MutualContactRequest = await req.json();

    console.log('Processing mutual contact addition for user:', user.id);
    console.log('Adding contact:', otherUserContactCard.name);

    // Step 1: Get current user's contact card
    const { data: myContactCard, error: myCardError } = await supabaseAdmin
      .from('user_contact_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (myCardError || !myContactCard) {
      console.error('Error fetching user contact card:', myCardError);
      return new Response(JSON.stringify({ 
        error: 'User contact card not found',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 2: Add their contact to current user's list
    const { error: addToMyListError } = await supabaseAdmin
      .from('contacts')
      .insert({
        user_id: user.id,
        name: otherUserContactCard.name,
        email: otherUserContactCard.email,
        phone: otherUserContactCard.phone,
        company: otherUserContactCard.company,
        industry: otherUserContactCard.industry,
        services: otherUserContactCard.services,
        tier: 'Acquaintance',
        notes: 'Added via share code',
        linkedin: otherUserContactCard.linkedin,
        facebook: otherUserContactCard.facebook,
        whatsapp: otherUserContactCard.whatsapp,
        websites: otherUserContactCard.websites,
        added_date: new Date().toISOString().split('T')[0],
        added_via: 'share_code'
      });

    if (addToMyListError && addToMyListError.code !== '23505') {
      console.error('Error adding to my contacts:', addToMyListError);
      return new Response(JSON.stringify({ 
        error: 'Failed to add contact to your list',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 3: Add current user to their contact list (using admin privileges)
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

    if (addToTheirListError && addToTheirListError.code !== '23505') {
      console.error('Error adding to their contacts:', addToTheirListError);
      // Don't fail completely - at least one direction worked
      return new Response(JSON.stringify({ 
        success: true,
        partial: true,
        message: 'Contact added to your list, but could not add you to theirs'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Mutual contact addition completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Mutual contact addition completed successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in add-mutual-contact function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);