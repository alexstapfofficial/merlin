import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'

// Client-only Supabase-Plugin (Capacitor/iOS-tauglich).
// - Session-Storage über @capacitor/preferences (nativ sicher persistiert,
//   im Web fällt @capacitor/preferences auf localStorage zurück).
// - PKCE-Flow, Auto-Refresh, persistente Session.
// - detectSessionInUrl=false: keine URL-Hash-Auswertung (Token kommt per
//   Bearer, nicht über Redirect-URLs).
// Stellt zusätzlich `$api` bereit: eine $fetch-Instanz mit baseURL=apiBase
// (Web: same-origin '', App: remote Vercel-API).
export default defineNuxtPlugin(() => {
  const { supabaseUrl, supabaseAnonKey, apiBase } = useRuntimeConfig().public

  // $fetch mit fixer baseURL aus der runtimeConfig.
  const api = $fetch.create({ baseURL: apiBase as string })

  // Storage-Adapter für Supabase Auth über Capacitor Preferences.
  const storage = {
    async getItem(key: string): Promise<string | null> {
      const { value } = await Preferences.get({ key })
      return value
    },
    async setItem(key: string, value: string): Promise<void> {
      await Preferences.set({ key, value })
    },
    async removeItem(key: string): Promise<void> {
      await Preferences.remove({ key })
    },
  }

  // Ohne konfigurierte ENV (Platzhalter) keinen Client erzeugen –
  // createClient('') würde sonst werfen und die ganze App lahmlegen.
  let supabase: SupabaseClient | null = null
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage,
        storageKey: 'horoskop-auth',
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  } else if (import.meta.dev) {
    console.warn('[supabase] SUPABASE_URL / SUPABASE_ANON_KEY fehlen – Auth deaktiviert.')
  }

  return {
    provide: { supabase, api },
  }
})
