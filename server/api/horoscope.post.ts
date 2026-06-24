// Beispiel-Route: authentifiziertes, user-spezifisches Horoskop.
// Demonstriert den App→API-Flow: das App-Target ruft diese Route remote mit
// `Authorization: Bearer <supabase-access-token>` auf. getAuthUser validiert
// das Token (anon key) und wirft sonst 401.
export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)

  // Platzhalter für echte, profilbezogene Logik – hier nur Dummy-Daten,
  // aber bewusst aus dem authentifizierten User abgeleitet.
  const seed = user.id.charCodeAt(0) || 0

  return {
    userId: user.id,
    email: user.email ?? null,
    date: new Date().toISOString().slice(0, 10),
    horoscope: {
      sign: 'Steinbock',
      message: `Hallo ${user.email ?? user.id}, heute steht der Mond günstig für dich.`,
      luckyNumber: (seed % 9) + 1,
    },
  }
})
