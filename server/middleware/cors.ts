// CORS nur für die API. Nötig, weil das App-Target (Capacitor, anderes Origin)
// die Routes per Bearer-Token cross-origin aufruft. Cookies werden NICHT genutzt,
// daher ist ACAO '*' unbedenklich (kein credentials-Modus).
export default defineEventHandler((event) => {
  const path = event.path || event.node.req.url || ''
  if (!path.startsWith('/api')) return

  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  })

  // Preflight sofort beantworten. sendNoContent setzt 204 UND beendet die
  // Anfrage (ein bloßes `return` würde in Nitro-Middleware durchfallen).
  if (event.method === 'OPTIONS') {
    return sendNoContent(event, 204)
  }
})
