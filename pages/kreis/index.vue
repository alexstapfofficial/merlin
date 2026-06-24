<template>
  <div class="m-screen">
    <div class="m-screen__inner" style="padding-left:0;padding-right:0">
      <div class="kr__head">
        <div>
          <div class="m-eyebrow">Mein Kreis</div>
          <div class="m-display" style="font-size:34px;margin-top:6px">Wer steht dir nah</div>
        </div>
        <NuxtLink to="/synastry" class="kr__add">
          <UIcon name="i-heroicons-plus" style="width:20px;height:20px" />
        </NuxtLink>
      </div>

      <NoProfile v-if="error === 'no-profile'" />

      <template v-else>
        <!-- me card -->
        <div class="kr__me">
          <div class="kr__me-av">{{ myInitials }}</div>
          <div style="flex:1">
            <div class="m-display" style="font-size:18px">{{ firstName }}</div>
            <div class="m-mono kr__me-sub">{{ meLine }}</div>
          </div>
          <NuxtLink to="/onboarding" class="m-pill m-pill--ghost">Mein Profil</NuxtLink>
        </div>

        <div class="m-eyebrow" style="padding:2px 26px 8px">Kompatibilität · {{ people.length }}</div>

        <div v-if="!people.length && !loading" class="kr__empty m-mono">
          Noch niemand im Kreis. Füge eine Person hinzu.
        </div>

        <div class="kr__list">
          <NuxtLink
            v-for="pp in people" :key="pp.id"
            :to="`/kreis/synastrie?friend=${pp.id}`" class="person"
          >
            <div class="person__ring">
              <svg width="48" height="48" viewBox="0 0 48 48" style="position:absolute;inset:0;transform:rotate(-90deg)">
                <circle cx="24" cy="24" r="22" fill="none" stroke="#E3DBC8" stroke-width="2" />
                <circle
                  v-if="pp.score != null" cx="24" cy="24" r="22" fill="none"
                  :stroke="ringColor(pp.score)" stroke-width="2"
                  :stroke-dasharray="`${(pp.score / 100) * 138.2} 138.2`" stroke-linecap="round"
                />
              </svg>
              <div class="person__init">{{ pp.init }}</div>
            </div>
            <div style="flex:1">
              <div class="m-display person__name">
                {{ pp.name }}
                <span v-if="pp.glyph" class="font-astronomicon" style="font-size:14px;color:var(--muted)">{{ pp.glyph }}</span>
              </div>
              <div class="m-mono person__sub">{{ pp.sub }}</div>
            </div>
            <div style="text-align:right">
              <div class="m-display" style="font-size:22px;color:var(--ink);line-height:1">
                {{ pp.score != null ? pp.score : '·' }}
              </div>
              <div class="m-mono person__von">VON 100</div>
            </div>
          </NuxtLink>
        </div>

        <NuxtLink to="/synastry" class="kr__addrow">+ Eine Person hinzufügen</NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useProfilesStore } from '~/stores/profilesStore';
import { useActiveChart } from '~/composables/useActiveChart';
import { useSynastry } from '~/composables/useSynastry';
import { useProfile } from '~/composables/useProfile';
import { useTranslateZodiac } from '~/composables/translateZodiac';

const profilesStore = useProfilesStore();
const { profile, error, ensureLoaded, bigThree } = useActiveChart();
const { calculateSynastry } = useSynastry();
const { formatBirthDate } = useProfile();
const { getZodiacSymbol, translateZodiacName } = useTranslateZodiac();

const loading = ref(true);
const people = ref([]);

const fullName = computed(() => profile.value?.name || 'Ich');
const firstName = computed(() => fullName.value.split(' ')[0]);
const myInitials = computed(() => initials(fullName.value));
const meLine = computed(() => {
  const b = bigThree.value;
  if (!b?.[0]?.sign || b[0].sign === '–') return '';
  return `☉ ${b[0].sign} · ☽ ${b[1].sign} · ↑ ${b[2].sign}`;
});

function initials(name) {
  return (name || '').split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}
const ringColor = (s) => (s >= 75 ? 'var(--gold)' : s >= 55 ? '#A89370' : 'var(--plum)');

const hasBirth = (f) => f?.birthdate && f?.birthtime && f?.coordinates?.length === 2;

onMounted(async () => {
  await ensureLoaded();
  if (error.value === 'no-profile') { loading.value = false; return; }

  const owner = profile.value;
  const friends = profilesStore.friends || [];

  // seed rows immediately, fill scores async
  people.value = friends.map((f) => ({
    id: f.id, name: f.name, init: initials(f.name),
    sub: hasBirth(f) ? formatBirthDate(f.birthdate) : 'Geburtsdaten fehlen',
    score: null, glyph: '',
  }));

  await Promise.all(friends.map(async (f, i) => {
    if (!hasBirth(f)) return;
    try {
      const res = await calculateSynastry(owner, f);
      const sun = res.person2Chart?.planetaryPositions?.find((x) => x.name === 'Sun');
      const sign = sun?.zodiacSign;
      people.value[i] = {
        ...people.value[i],
        score: res.compatibilityScore?.total ?? null,
        glyph: sign ? getZodiacSymbol(sign) : '',
        sub: sign ? `${translateZodiacName(sign)} · ${formatBirthDate(f.birthdate)}` : people.value[i].sub,
      };
    } catch (e) {
      console.error('Synastry failed for', f.name, e);
    }
  }));

  loading.value = false;
});
</script>

<style scoped>
.kr__head { padding: 12px 22px 0; display: flex; justify-content: space-between; align-items: flex-end; }
.kr__add {
  width: 42px; height: 42px; border-radius: 50%; background: var(--ink); color: #F1ECDF;
  display: flex; align-items: center; justify-content: center; flex: none;
}

.kr__me {
  margin: 18px 22px 14px; padding: 14px 16px; border-radius: 16px;
  background: var(--ink); color: #F1ECDF; display: flex; align-items: center; gap: 12px;
}
.kr__me-av {
  width: 46px; height: 46px; border-radius: 50%; background: #F1ECDF; color: var(--ink);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display); font-size: 18px; flex: none;
}
.kr__me-sub { font-size: 11px; color: rgba(241, 236, 223, 0.55); margin-top: 2px; }

.kr__empty { margin: 0 22px 12px; color: var(--muted); font-size: 12px; text-align: center; padding: 10px; }
.kr__list { margin: 0 22px; display: flex; flex-direction: column; gap: 8px; }
.person {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  background: var(--card); border: 0.5px solid var(--line); border-radius: 14px;
  text-decoration: none; color: var(--ink);
}
.person__ring { position: relative; width: 48px; height: 48px; flex: none; }
.person__init {
  position: absolute; inset: 5px; border-radius: 50%; background: var(--paper);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display); font-size: 15px; color: var(--ink);
}
.person__name { font-size: 17px; display: flex; align-items: center; gap: 6px; }
.person__sub { font-size: 11.5px; color: var(--muted); letter-spacing: 0.3px; margin-top: 1px; }
.person__von { font-size: 9.5px; color: var(--muted); letter-spacing: 1px; }

.kr__addrow {
  display: block; margin: 18px 22px 0; padding: 14px; border-radius: 14px; border: 1px dashed var(--hair);
  color: var(--muted); font-size: 13px; text-align: center; text-decoration: none;
}
</style>
