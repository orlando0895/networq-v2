import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectUsersRequest {
  shareCode: string;
  currentUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 CONNECT USERS: Function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
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

    const { shareCode, currentUserId }: ConnectUsersRequest = await req.json();
    console.log('📋 Request:', { shareCode, currentUserId });

    if (!shareCode || !currentUserId) {
      return new Response(JSON.stringify({ 
        error: 'Missing shareCode or currentUserId', 
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Find the target user's contact card by share code
    console.log('🔍 Finding target user by share code...');
    const { data: targetContactCard, error: targetError } = await supabaseAdmin
      .from('user_contact_cards')
      .select('*')
      .eq('share_code', shareCode)
      .eq('is_active', true)
      .maybeSingle();

    if (targetError || !targetContactCard) {
      console.error('❌ Target contact card not found:', targetError);
      return new Response(JSON.stringify({ 
        error: 'Contact not found with this share code',
        success: false 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Found target contact card:', targetContactCard.name);

    // Step 2: Get current user's contact card
    console.log('📋 Getting current user contact card...');
    const { data: currentUserCard, error: currentUserError } = await supabaseAdmin
      .from('user_contact_cards')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .maybeSingle();

    if (currentUserError || !currentUserCard) {
      console.error('❌ Current user contact card not found:', currentUserError);
      return new Response(JSON.stringify({ 
        error: 'Your contact card not found',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Found current user contact card:', currentUserCard.name);

    // Prevent self-connection
    if (targetContactCard.user_id === currentUserId) {
      return new Response(JSON.stringify({ 
        error: 'Cannot add yourself as a contact',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 3: Add target user to current user's contacts
    console.log('📝 Adding target user to current user contacts...');
    const { error: addToCurrentError } = await supabaseAdmin
      .from('contacts')
      .upsert({
        user_id: currentUserId,
        name: targetContactCard.name,
        email: targetContactCard.email,
        phone: targetContactCard.phone,
        company: targetContactCard.company,
        industry: targetContactCard.industry,
        services: targetContactCard.services,
        tier: 'Acquaintance',
        notes: 'Added via share code',
        linkedin: targetContactCard.linkedin,
        facebook: targetContactCard.facebook,
        whatsapp: targetContactCard.whatsapp,
        websites: targetContactCard.websites,
        added_date: new Date().toISOString().split('T')[0],
        added_via: 'share_code'
      }, {
        onConflict: 'user_id,email',
        ignoreDuplicates: true
      });

    if (addToCurrentError && addToCurrentError.code !== '23505') {
      console.error('❌ Error adding to current user contacts:', addToCurrentError);
    } else {
      console.log('✅ Added target user to current user contacts');
    }

    // Step 4: Add current user to target user's contacts
    console.log('📝 Adding current user to target user contacts...');
    const { error: addToTargetError } = await supabaseAdmin
      .from('contacts')
      .upsert({
        user_id: targetContactCard.user_id,
        name: currentUserCard.name,
        email: currentUserCard.email,
        phone: currentUserCard.phone,
        company: currentUserCard.company,
        industry: currentUserCard.industry,
        services: currentUserCard.services,
        tier: 'Acquaintance',
        notes: 'Added via mutual contact',
        linkedin: currentUserCard.linkedin,
        facebook: currentUserCard.facebook,
        whatsapp: currentUserCard.whatsapp,
        websites: currentUserCard.websites,
        added_date: new Date().toISOString().split('T')[0],
        added_via: 'mutual_contact'
      }, {
        onConflict: 'user_id,email',
        ignoreDuplicates: true
      });

    if (addToTargetError && addToTargetError.code !== '23505') {
      console.error('❌ Error adding to target user contacts:', addToTargetError);
    } else {
      console.log('✅ Added current user to target user contacts');
    }

    console.log('🎉 CONNECT USERS: Mutual connection completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Users connected successfully',
      targetUser: {
        name: targetContactCard.name,
        email: targetContactCard.email
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('💥 CONNECT USERS: Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: `Unexpected error: ${error.message}`,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);