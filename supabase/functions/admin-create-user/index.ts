import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function extractBearer(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return new Response('Missing env', { status: 500, headers: corsHeaders })
  }

  const token = extractBearer(req)
  if (!token) return new Response('Missing Authorization', { status: 401, headers: corsHeaders })

  const anon = createClient(supabaseUrl, anonKey)
  const { data: userData, error: userError } = await anon.auth.getUser(token)
  if (userError || !userData.user) {
    return new Response('Invalid JWT', { status: 401, headers: corsHeaders })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const email = (userData.user.email ?? '').toLowerCase()
  if (!email) return new Response('Missing email', { status: 403, headers: corsHeaders })

  const { data: adminRow } = await admin
    .from('doctors')
    .select('id')
    .eq('email', email)
    .eq('is_admin', true)
    .maybeSingle()

  if (!adminRow) return new Response('Admin only', { status: 403, headers: corsHeaders })

  let payload: { email?: string; password?: string; data?: Record<string, unknown> }
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders })
  }

  const targetEmail = String(payload.email ?? '').trim().toLowerCase()
  const password = String(payload.password ?? '').trim()
  if (!targetEmail || !password) {
    return new Response('email/password required', { status: 400, headers: corsHeaders })
  }

  const { data: existing, error: listError } = await admin.auth.admin.listUsers()
  if (listError) return new Response(listError.message, { status: 400, headers: corsHeaders })

  const current = existing.users.find((u) => u.email?.toLowerCase() === targetEmail)
  if (current) {
    const { data, error } = await admin.auth.admin.updateUserById(current.id, {
      password,
      email_confirm: true,
      user_metadata: payload.data ?? {},
    })
    if (error) return new Response(error.message, { status: 400, headers: corsHeaders })
    return new Response(JSON.stringify({ id: data.user?.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: targetEmail,
    password,
    email_confirm: true,
    user_metadata: payload.data ?? {},
  })
  if (error) return new Response(error.message, { status: 400, headers: corsHeaders })

  return new Response(JSON.stringify({ id: data.user?.id }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
