<template>
  <div class="m-screen">
    <div class="m-screen__inner shop">
      <!-- header -->
      <div class="shop__head">
        <div class="m-eyebrow">Merlin · Deutungen</div>
        <div class="m-display shop__title">Deine<br />Deutungen.</div>
        <p class="shop__intro">
          Tiefgehende, persönliche Lesungen deines Himmels — von erfahrenen
          Astrolog:innen für dich aufbereitet.
        </p>
      </div>

      <!-- products -->
      <div class="shop__list">
        <article
          v-for="p in products"
          :key="p.key"
          class="m-card shop__card"
          :class="{ 'shop__card--feature': p.feature }"
        >
          <div v-if="p.badge" class="shop__badge">{{ p.badge }}</div>

          <div class="shop__card-head">
            <span class="shop__glyph m-glyph">{{ p.glyph }}</span>
            <div style="flex:1">
              <div class="m-eyebrow" :style="{ color: p.feature ? 'rgba(232,201,136,0.8)' : 'var(--muted)' }">
                {{ p.kicker }}
              </div>
              <h2 class="m-display shop__card-title">{{ p.title }}</h2>
            </div>
          </div>

          <p class="shop__desc" :style="{ color: p.feature ? 'rgba(241,236,223,0.78)' : 'var(--ink-2)' }">
            {{ p.desc }}
          </p>

          <ul class="shop__features">
            <li v-for="f in p.features" :key="f" class="shop__feature">
              <UIcon name="i-heroicons-check" class="shop__check" :style="{ color: p.feature ? 'var(--gold-light)' : 'var(--gold)' }" />
              <span>{{ f }}</span>
            </li>
          </ul>

          <div class="shop__buy">
            <div class="shop__price">
              <span class="m-mono shop__price-cur">€</span>
              <span class="m-display shop__price-amt">{{ p.price }}</span>
              <span class="m-mono shop__price-note">einmalig</span>
            </div>
            <button
              type="button"
              class="m-btn shop__cta"
              :class="{ 'shop__cta--ghost': p.feature }"
              @click="select(p)"
            >
              {{ p.to ? 'Deutung ansehen' : 'Freischalten' }}
            </button>
          </div>
        </article>
      </div>

      <!-- bundle hint -->
      <div class="shop__note m-mono">
        <UIcon name="i-heroicons-shield-check" style="width:14px;height:14px" />
        <span>Einmalzahlung · zeitlich unbegrenzter Zugriff</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const year = new Date().getFullYear();

const products = [
  {
    key: 'birthchart',
    kicker: 'Das Fundament',
    title: 'Geburtshoroskop',
    glyph: 'Q', // Sonne (Astronomicon)
    desc:
      'Deine vollständige Geburtskonstellation — gedeutet Haus für Haus, Planet für Planet. Wer du im Kern bist und welche Kräfte dich prägen.',
    features: [
      'Sonne, Mond & Aszendent im Detail',
      'Alle Planeten in Zeichen & Häusern',
      'Deine prägendsten Aspekte',
      'Persönliche Stärken & Entwicklungsweg',
    ],
    price: '29',
    feature: true,
    badge: 'Beliebt',
    to: '/deutungen/geburtshoroskop',
  },
  {
    key: 'yearforecast',
    kicker: 'Der Ausblick',
    title: `Jahresvorhersage ${year}`,
    glyph: 'V', // Jupiter (Astronomicon)
    desc:
      `Was ${year} für dich bereithält. Die wichtigsten Transite und Wendepunkte deines Jahres — Monat für Monat eingeordnet.`,
    features: [
      `Überblick über dein Jahr ${year}`,
      'Wichtige Transite & Zeitfenster',
      'Chancen, Themen & Wendepunkte',
      'Monatliche Schwerpunkte',
    ],
    price: '19',
    feature: false,
  },
];

const select = (product) => {
  // Paywall folgt später — vorerst direkt zur Deutung, sofern vorhanden.
  if (product.to) navigateTo(product.to);
};
</script>

<style scoped>
.shop__head { padding-top: 8px; }
.shop__title { font-size: 38px; margin-top: 4px; }
.shop__intro {
  font-size: 14px; line-height: 1.5; color: var(--ink-2);
  margin-top: 12px; max-width: 30ch;
}

.shop__list { display: flex; flex-direction: column; gap: 14px; margin-top: 24px; }

.shop__card { position: relative; padding: 18px; overflow: hidden; }
.shop__card--feature {
  background: var(--ink);
  color: #F1ECDF;
  border: none;
}

.shop__badge {
  position: absolute; top: 14px; right: 14px;
  font-family: var(--mono); font-size: 9.5px; letter-spacing: 1px; text-transform: uppercase;
  padding: 4px 9px; border-radius: 100px;
  background: var(--gold-light); color: var(--ink); font-weight: 700;
}

.shop__card-head { display: flex; align-items: center; gap: 14px; }
.shop__glyph {
  font-size: 30px; width: 52px; height: 52px; flex: none;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px;
  background: rgba(176, 122, 44, 0.12); color: var(--gold);
}
.shop__card--feature .shop__glyph {
  background: rgba(241, 236, 223, 0.08); color: var(--gold-light);
}
.shop__card-title { font-size: 22px; margin-top: 1px; }

.shop__desc { font-size: 13px; line-height: 1.5; margin-top: 14px; }

.shop__features { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.shop__feature { display: flex; align-items: center; gap: 9px; font-size: 13px; line-height: 1.3; }
.shop__check { width: 16px; height: 16px; flex: none; }

.shop__buy {
  display: flex; align-items: center; gap: 14px;
  margin-top: 20px; padding-top: 16px;
  border-top: 0.5px solid var(--line);
}
.shop__card--feature .shop__buy { border-top-color: rgba(241, 236, 223, 0.14); }

.shop__price { display: flex; align-items: baseline; gap: 3px; flex: none; }
.shop__price-cur { font-size: 14px; opacity: 0.7; }
.shop__price-amt { font-size: 34px; }
.shop__price-note { font-size: 10px; opacity: 0.6; margin-left: 4px; align-self: flex-end; margin-bottom: 4px; }

.shop__cta { height: 48px; flex: 1; font-size: 16px; }
.shop__cta--ghost {
  background: var(--gold-light); color: var(--ink);
}

.shop__note {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  margin-top: 18px; font-size: 10.5px; letter-spacing: 0.4px; color: var(--muted);
}
</style>
