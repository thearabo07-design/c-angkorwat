import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supportedTargets = new Set(['km', 'fr', 'zh-CN'])
const glossary = {
  'Angkor Wat': { km: 'អង្គរវត្ត', fr: 'Angkor Wat', 'zh-CN': '吴哥窟' },
  Khmer: { km: 'ខ្មែរ', fr: 'khmer', 'zh-CN': '高棉' },
  Cambodia: { km: 'កម្ពុជា', fr: 'Cambodge', 'zh-CN': '柬埔寨' },
}

const text = { type: 'string', minLength: 1, maxLength: 5000 }
const maybeText = { type: 'string', maxLength: 5000 }
const url = { type: 'string', maxLength: 2000 }
const contentSchema = {
  type: 'object', additionalProperties: false,
  required: ['stories', 'gallery', 'audio', 'models', 'visit', 'contact'],
  properties: {
    stories: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['number', 'title', 'text'], properties: { number: { type: 'string' }, title: text, text } } },
    gallery: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'detail', 'imageUrl', 'className'], properties: { title: text, detail: text, imageUrl: url, className: { type: 'string' } } } },
    audio: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'description', 'audioUrl'], properties: { title: text, description: maybeText, audioUrl: url } } },
    models: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'description', 'modelUrl', 'iosUrl', 'posterUrl'], properties: { title: text, description: maybeText, modelUrl: url, iosUrl: url, posterUrl: url } } },
    visit: { type: 'object', additionalProperties: false, required: ['hours', 'bestTime', 'guidance'], properties: { hours: text, bestTime: text, guidance: text } },
    contact: { type: 'object', additionalProperties: false, required: ['email', 'phone', 'socialLabel', 'socialUrl'], properties: { email: { type: 'string' }, phone: { type: 'string' }, socialLabel: { type: 'string' }, socialUrl: url } },
  },
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) throw new Error('Authentication required.')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } })
    const { data: isAdmin, error: roleError } = await userClient.rpc('is_admin')
    if (roleError || !isAdmin) return new Response(JSON.stringify({ error: 'Administrator access required.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { source_language, target_language, source_content } = await request.json()
    if (source_language !== 'en' || !supportedTargets.has(target_language) || !source_content) throw new Error('Invalid translation request.')
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.')

    const instructions = `You are the translation engine for C Angkorwat, a Cambodian cultural heritage website. Translate from English into the requested target language. Preserve meaning, facts, respectful tone, object structure, IDs, URLs, media paths, email addresses, phone numbers, numbers, and formatting tokens exactly. Never invent facts. Follow the glossary. Keep titles concise. Return only the structured translation. For Khmer, use natural modern Khmer and flag nothing in the content itself.`
    const input = `SOURCE LANGUAGE: ${source_language}\nTARGET LANGUAGE: ${target_language}\n\nPROTECTED GLOSSARY:\n${JSON.stringify(glossary)}\n\nSOURCE CONTENT:\n${JSON.stringify(source_content)}`
    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_MODEL') || 'gpt-5.4-mini',
        instructions,
        input,
        store: false,
        text: { format: { type: 'json_schema', name: 'site_translation', strict: true, schema: contentSchema } },
      }),
    })
    const responseData = await openAiResponse.json()
    if (!openAiResponse.ok) throw new Error(responseData?.error?.message || 'OpenAI translation failed.')
    const outputText = responseData.output?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? []).find((part: { type?: string }) => part.type === 'output_text')?.text
    if (!outputText) throw new Error('OpenAI returned no translation content.')
    const content = JSON.parse(outputText)
    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
