import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a business card OCR expert. Extract contact information from business card images and return it as JSON. Return only valid JSON with these exact fields:
{
  "name": "string",
  "email": "string", 
  "phone": "string",
  "company": "string",
  "industry": "string",
  "linkedin": "string",
  "facebook": "string",
  "whatsapp": "string",
  "websites": ["string"],
  "notes": "string"
}

Guidelines:
- Extract only visible information from the card
- For industry, infer from company name/description if not explicitly stated
- For social media, extract usernames or full URLs
- For websites, include all web addresses found
- Keep phone numbers in original format
- Leave fields empty ("") if not found, except websites which should be []
- For notes, include any additional context like job title or specialties`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all contact information from this business card image:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const extractedText = data.choices[0].message.content;
    
    // Parse the JSON response
    let contactInfo;
    try {
      contactInfo = JSON.parse(extractedText);
    } catch (e) {
      throw new Error('Failed to parse extracted contact information');
    }

    return new Response(
      JSON.stringify({ success: true, contactInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scan-business-card function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process business card' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});