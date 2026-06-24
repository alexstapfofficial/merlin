<template>
  <div class="m-screen">
    <div class="m-screen__inner onb">
      <!-- mini header -->
      <div class="onb__head">
        <span class="m-display" style="font-size:22px;letter-spacing:.5px">merlin</span>
        <span class="m-eyebrow">{{ isEditing ? 'Profil' : 'Neu' }}</span>
      </div>

      <!-- hero ring -->
      <div class="onb__ring-wrap">
        <div class="onb__ring-outer">
          <div class="onb__ring-inner">
            <span class="m-glyph" style="font-size:64px;color:var(--ink)">R</span>
          </div>
        </div>
        <span
          v-for="a in [0, 60, 120, 180, 240, 300]" :key="a" class="onb__dot"
          :style="{ transform: `rotate(${a}deg) translate(86px) rotate(-${a}deg)` }"
        />
      </div>

      <div class="m-display onb__title">{{ isEditing ? 'Deine Geburtsdaten.' : 'Dein Geburtsmoment.' }}</div>
      <p class="onb__lead">
        Wir berechnen daraus die exakte Position aller Himmelskörper — auf die Minute genau.
      </p>

      <template v-if="ready">
        <!-- fields -->
        <div class="onb__fields">
          <div class="onb__field">
            <label class="onb__label">Name</label>
            <input v-model="formData.name" class="onb__input" type="text" placeholder="Vollständiger Name" />
          </div>

          <div class="onb__field-row">
            <div class="onb__field">
              <label class="onb__label">Geburtstag</label>
              <BirthdayPicker :initialDate="formData.birthdate" @new-date="(n) => formData.birthdate = n" />
            </div>
            <div class="onb__field">
              <label class="onb__label">Geburtszeit</label>
              <BirthTimeInput :initialTime="formData.birthtime" @new-time="(n) => formData.birthtime = n" />
            </div>
          </div>

          <div class="onb__field">
            <LocationInput :initialCoordinates="formData.coordinates" @new-coordinates="(n) => formData.coordinates = n" />
          </div>
        </div>

        <p v-if="errorMsg" class="onb__error">{{ errorMsg }}</p>

        <button class="m-btn onb__cta" :disabled="!isValid || saving" @click="save">
          <template v-if="saving">Wird berechnet…</template>
          <template v-else>
            Himmel berechnen <span class="m-glyph" style="font-size:20px">→</span>
          </template>
        </button>
      </template>
      <div v-else class="onb__loading m-mono">Lädt…</div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

import { useProfilesStore } from '~/stores/profilesStore';

const profilesStore = useProfilesStore();
const router = useRouter();

const ready = ref(false);
const saving = ref(false);
const errorMsg = ref('');

const formData = ref({ name: '', birthdate: {}, birthtime: {}, coordinates: [] });

const isEditing = computed(() => !!profilesStore.profile);

const isValid = computed(() =>
  !!formData.value.name &&
  formData.value.birthdate && Object.keys(formData.value.birthdate).length > 0 &&
  formData.value.birthtime && Object.keys(formData.value.birthtime).length > 0 &&
  Array.isArray(formData.value.coordinates) && formData.value.coordinates.length === 2
);

onMounted(async () => {
  if (!profilesStore.profile) await profilesStore.fetchProfiles().catch(() => {});
  const p = profilesStore.profile;
  if (p) {
    formData.value = {
      name: p.name || '',
      birthdate: p.birthdate || {},
      birthtime: p.birthtime || {},
      coordinates: p.coordinates || [],
    };
  }
  ready.value = true;
});

const save = async () => {
  if (!isValid.value || saving.value) return;
  saving.value = true;
  errorMsg.value = '';
  try {
    await profilesStore.setProfile({
      name: formData.value.name,
      birthdate: formData.value.birthdate,
      birthtime: formData.value.birthtime,
      coordinates: formData.value.coordinates,
    });
    await router.push('/himmel');
  } catch (e) {
    console.error('Profil speichern fehlgeschlagen', e);
    errorMsg.value = 'Speichern fehlgeschlagen. Bitte erneut versuchen.';
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.onb { display: flex; flex-direction: column; min-height: 100dvh; }
.onb__head { display: flex; align-items: center; justify-content: space-between; }

.onb__ring-wrap {
  display: flex; justify-content: center; align-items: center;
  margin: 18px 0 6px; position: relative; height: 172px;
}
.onb__ring-outer {
  width: 172px; height: 172px; border-radius: 50%;
  border: 0.5px dashed var(--hair);
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 50% 50%, rgba(176, 122, 44, 0.10), transparent 70%);
}
.onb__ring-inner {
  width: 128px; height: 128px; border-radius: 50%; border: 0.5px solid var(--hair);
  display: flex; align-items: center; justify-content: center;
}
.onb__dot {
  position: absolute; top: 50%; left: 50%;
  width: 4px; height: 4px; background: var(--ink); border-radius: 4px;
  margin-top: -2px; margin-left: -2px;
}

.onb__title { font-size: 32px; text-align: center; margin-top: 8px; }
.onb__lead {
  text-align: center; color: var(--ink-2); font-size: 14px;
  margin: 8px 26px 22px; line-height: 1.45;
}

.onb__fields { display: flex; flex-direction: column; gap: 12px; }
.onb__field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.onb__field { display: flex; flex-direction: column; gap: 6px; }
.onb__label {
  font-size: 10.5px; font-family: var(--mono); color: var(--muted);
  letter-spacing: 1.4px; text-transform: uppercase;
}
.onb__input {
  width: 100%; padding: 13px 16px;
  background: var(--card); border: 0.5px solid var(--line); border-radius: 14px;
  font-size: 15.5px; color: var(--ink); font-family: var(--body);
}
.onb__input:focus { outline: none; border-color: var(--ink); }

.onb__error { color: #b3402f; font-size: 12.5px; text-align: center; margin: 12px 0 0; }
.onb__cta { margin-top: 22px; }
.onb__cta:disabled { opacity: 0.5; cursor: not-allowed; }
.onb__loading { text-align: center; color: var(--muted); padding: 30px; font-size: 12px; }
</style>
