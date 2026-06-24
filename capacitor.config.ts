import type { CapacitorConfig } from '@capacitor/cli'

// Capacitor lädt das via `npm run generate:app` erzeugte SPA-Bundle aus
// .output/public. Vor `npx cap sync` muss also generate:app gelaufen sein
// (der `ios`-Script erledigt beides).
const config: CapacitorConfig = {
  appId: 'de.dreams2code.horoskop',
  appName: 'Horoskop',
  webDir: '.output/public',
}

export default config
