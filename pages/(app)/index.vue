<template>
  <div class="apphome">
    <header class="apphome__head">
      <p class="apphome__eyebrow">Dein Tag im Himmel</p>
      <h1 class="apphome__title">Horoskop</h1>
    </header>

    <div v-if="loading" class="apphome__state m-mono">Lädt…</div>

    <!-- Login-Stub: keine / abgelaufene Session -->
    <section v-else-if="!authed" class="apphome__login">
      <p class="apphome__lead">Melde dich an, um dein persönliches Horoskop zu sehen.</p>
      <UButton color="primary" block size="lg" @click="signIn">Anmelden</UButton>
      <p v-if="note" class="apphome__note m-mono">{{ note }}</p>
    </section>

    <!-- Authentifiziert: Ergebnis vom Remote-API (Vercel) -->
    <section v-else class="apphome__result">
      <p class="apphome__greet">{{ data?.horoscope?.message }}</p>
      <dl class="apphome__meta">
        <div><dt>Zeichen</dt><dd>{{ data?.horoscope?.sign }}</dd></div>
        <div><dt>Glückszahl</dt><dd>{{ data?.horoscope?.luckyNumber }}</dd></div>
        <div><dt>Datum</dt><dd>{{ data?.date }}</dd></div>
      </dl>
      <UButton variant="ghost" size="sm" @click="signOut">Abmelden</UButton>
    </section>

    <p v-if="error" class="apphome__error m-mono">{{ error }}</p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

// $supabase + $api stammen aus plugins/supabase.client.ts
const { $supabase } = useNuxtApp()
const { apiBase } = useRuntimeConfig().public

const loading = ref(true)
const authed = ref(false)
const data = ref(null)
const error = ref('')
const note = ref('')

// Authentifizierter Remote-Call: Bearer-Token an die Vercel-API.
// apiBase: Web = '' (same-origin), App = remote Vercel-URL.
const fetchHoroscope = (token) =>
  $fetch(`${apiBase}/api/horoscope`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

onMounted(async () => {
  try {
    if (!$supabase) {
      note.value = 'Supabase ist nicht konfiguriert (Platzhalter-ENV).'
      return
    }
    const { data: { session } } = await $supabase.auth.getSession()
    if (!session) return // → Login-Stub
    authed.value = true
    data.value = await fetchHoroscope(session.access_token)
  } catch (e) {
    // 401 → Session ungültig/abgelaufen → zurück zum Login-Stub
    if (e?.statusCode === 401) authed.value = false
    error.value = e?.statusMessage || e?.message || 'Fehler beim Laden'
  } finally {
    loading.value = false
  }
})

const signIn = () => {
  if (!$supabase) { note.value = 'Auth nicht verfügbar (ENV fehlt).'; return }
  // Stub: der echte PKCE-/OAuth-Login wird später angebunden.
  note.value = 'Login-Flow ist noch ein Stub – hier käme Supabase Sign-in (PKCE).'
}

const signOut = async () => {
  if ($supabase) await $supabase.auth.signOut()
  authed.value = false
  data.value = null
}
</script>

<style scoped>
.apphome { padding: 28px 22px; max-width: 560px; margin: 0 auto; }
.apphome__eyebrow { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted, #8F8978); }
.apphome__title { font-size: 34px; font-weight: 700; margin-top: 4px; }
.apphome__state { margin-top: 24px; color: var(--muted, #8F8978); }
.apphome__login { margin-top: 28px; display: flex; flex-direction: column; gap: 14px; }
.apphome__lead { font-size: 15px; line-height: 1.5; color: var(--ink-2, #5A554A); }
.apphome__note { font-size: 11.5px; color: var(--muted, #8F8978); }
.apphome__result { margin-top: 24px; }
.apphome__greet { font-size: 18px; line-height: 1.45; }
.apphome__meta { margin: 18px 0; display: flex; flex-direction: column; gap: 8px; }
.apphome__meta > div { display: flex; justify-content: space-between; border-bottom: 0.5px solid var(--line, #E3DBC8); padding-bottom: 6px; }
.apphome__meta dt { color: var(--muted, #8F8978); font-size: 13px; }
.apphome__meta dd { font-weight: 600; }
.apphome__error { margin-top: 16px; color: #b3402f; font-size: 12.5px; }
</style>
