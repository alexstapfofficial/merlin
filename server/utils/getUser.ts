import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

// Validiert das per `Authorization: Bearer <token>` übergebene Supabase
// Access-Token serverseitig. Es wird ausschließlich der ANON KEY verwendet
// (niemals service_role). Fehlt/ungültig/abgelaufen → 401. Sonst: User-Objekt.
export async function getAuthUser(event: H3Event) {
  const header = getRequestHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Kein Bearer-Token' })
  }

  const { supabaseUrl, supabaseAnonKey } = useRuntimeConfig(event).public
  if (!supabaseUrl || !supabaseAnonKey) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase ist nicht konfiguriert' })
  }

  // Stateless Validierung: Client ohne Session-Persistenz, Token explizit prüfen.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Ungültiges oder abgelaufenes Token' })
  }

  return data.user
}
