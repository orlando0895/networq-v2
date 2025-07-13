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
    console.log('Function called, checking API key...');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not configured' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('API key found, parsing request...');

    const { imageData } = await req.json();
    console.log('Request parsed, image data length:', imageData?.length || 'undefined');
    
    if (!imageData) {
      console.error('No image data provided');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Image data is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Making OpenAI API call...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

    console.log('OpenAI API response status:', response.status);
    const data = await response.json();
    console.log('OpenAI API response data:', data);
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error?.message || `OpenAI API error: ${response.status}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedText = data.choices[0].message.content;
    console.log('Extracted text from OpenAI:', extractedText);
    
    // Parse the JSON response
    let contactInfo;
    try {
      contactInfo = JSON.parse(extractedText);
      console.log('Successfully parsed contact info:', contactInfo);
    } catch (e) {
      console.error('Failed to parse JSON:', e, 'Raw text:', extractedText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to parse extracted contact information' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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