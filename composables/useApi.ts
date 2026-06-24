// Zentrale $fetch-Instanz mit baseURL = runtimeConfig.public.apiBase.
//  - Web-Build:  apiBase = ''        → relative /api-Pfade (same-origin).
//  - App-Build:  apiBase = remote    → Aufrufe gehen an die Vercel-API.
// Wichtig fürs Capacitor-SPA: dort gibt es KEINEN lokalen Server, relative
// /api-Pfade liefen sonst ins Leere. Alle API-Aufrufe laufen über useApi().
export const useApi = () => {
  const { apiBase } = useRuntimeConfig().public
  return $fetch.create({ baseURL: (apiBase as string) || '' })
}
