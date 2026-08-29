import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const languages = new Set(['en', 'km', 'fr', 'zh-CN'])
const voices = new Set(['coral', 'nova', 'onyx'])

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) return json({ error: 'Authentication required.' }, 401)
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
    const { data: isAdmin, error: roleError } = await userClient.rpc('is_admin')
    if (roleError || !isAdmin) return json({ error: 'Administrator access required.' }, 403)

    const { text, language, voice } = await request.json()
    if (typeof text !== 'string' || !text.trim() || text.length > 4000) return json({ error: 'Enter between 1 and 4,000 characters.' }, 400)
    if (!languages.has(language) || !voices.has(voice)) return json({ error: 'Unsupported language or voice.' }, 400)
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) return json({ error: 'OPENAI_API_KEY is not configured.' }, 500)

    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_TTS_MODEL') || 'gpt-4o-mini-tts',
        voice,
        input: text.trim(),
        instructions: `Speak naturally and respectfully in ${language}. Use clear museum-guide pacing and preserve the pronunciation of Angkor Wat and Khmer names.`,
        response_format: 'mp3',
      }),
    })
    if (!speechResponse.ok) {
      const problem = await speechResponse.json().catch(() => null)
      console.error('OpenAI speech request failed', speechResponse.status, problem?.error?.code || problem?.error?.type || 'unknown')
      return json({ error: problem?.error?.message || 'OpenAI speech generation failed.' }, speechResponse.status)
    }
    const bytes = new Uint8Array(await speechResponse.arrayBuffer())
    let binary = ''
    const chunkSize = 0x8000
    for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
    return json({ audio: btoa(binary), media_type: 'audio/mpeg' })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Speech generation failed.' }, 400)
  }
})
