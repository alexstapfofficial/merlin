<template>
  <div class="m-screen">
    <div class="m-screen__inner" style="padding-left:0;padding-right:0">
      <!-- header -->
      <div class="wd__head">
        <NuxtLink to="/wiki" class="wd__back">
          <UIcon name="i-heroicons-chevron-left" style="width:16px;height:16px" />
          <span>Wiki</span>
        </NuxtLink>

        <template v-if="category">
          <div class="m-eyebrow" style="margin-top:14px">{{ category.eyebrow }}</div>
          <div class="m-display wd__title">{{ category.title }}</div>
          <p class="wd__intro">{{ category.intro }}</p>
        </template>
      </div>

      <div v-if="!category" class="wd__missing m-mono">
        Diese Kategorie gibt es nicht. <NuxtLink to="/wiki" style="color:var(--gold)">Zurück zum Wiki</NuxtLink>
      </div>

      <!-- accordion list (optional nach Abschnitten gruppiert) -->
      <template v-else v-for="(grp, gi) in groups" :key="gi">
        <div v-if="grp.title" class="m-eyebrow wd__group">{{ grp.title }}</div>
        <div class="wd__list" :class="{ 'wd__list--plain': category.glyphKind === 'none' }">
          <div v-for="e in grp.entries" :key="e.id" class="wd__item">
            <button
              type="button" class="wd__row"
              :class="{ open: openId === e.id }"
              @click="toggle(e.id)"
            >
              <span
                v-if="category.glyphKind !== 'none'"
                class="wd__glyph" :class="`wd__glyph--${category.glyphKind}`"
              >
                {{ category.glyphKind === 'number' ? e.n : e.glyph }}
              </span>
              <div style="flex:1;text-align:left;min-width:0">
                <div class="m-display wd__row-title">{{ e.title }}</div>
                <div class="wd__row-meta m-mono">{{ e.meta }}</div>
              </div>
              <UIcon
                name="i-heroicons-chevron-down" class="wd__chev"
                :class="{ open: openId === e.id }"
              />
            </button>

            <!-- collapsed essence -->
            <div v-if="openId !== e.id" class="wd__essence">{{ e.essence }}</div>

            <!-- expanded body -->
            <Transition name="wd-expand">
              <div v-if="openId === e.id" class="wd__body">
                <div class="ra__prose" v-html="renderMarkdown(e.body)" />
              </div>
            </Transition>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

import { useWiki } from '~/composables/useWiki';
import { renderMarkdown } from '~/composables/useMarkdown';

const route = useRoute();
const { getCategory } = useWiki();

const category = computed(() => getCategory(route.params.category));

// Einträge nach optionalem `section`-Feld gruppieren (sonst eine Gruppe ohne Titel)
const groups = computed(() => {
  const cat = category.value;
  if (!cat) return [];
  if (!cat.entries.some((e) => e.section)) return [{ title: null, entries: cat.entries }];
  const out = [];
  for (const e of cat.entries) {
    let g = out.find((x) => x.title === e.section);
    if (!g) { g = { title: e.section, entries: [] }; out.push(g); }
    g.entries.push(e);
  }
  return out;
});

const openId = ref(null);
const toggle = (id) => { openId.value = openId.value === id ? null : id; };
</script>

<style scoped>
.wd__head { padding: 12px 22px 6px; }
.wd__back {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; color: var(--muted); text-decoration: none; font-weight: 600;
}
.wd__title { font-size: 34px; margin-top: 6px; }
.wd__intro {
  font-size: 14px; line-height: 1.55; color: var(--ink-2);
  margin-top: 10px; max-width: 40ch;
}

.wd__missing { padding: 40px 22px; font-size: 13px; color: var(--muted); }

.wd__group { padding: 24px 26px 8px; }
.wd__group + .wd__list { margin-top: 0; }

.wd__list {
  margin: 16px 22px 0; display: flex; flex-direction: column;
  background: var(--card); border: 0.5px solid var(--line); border-radius: 16px; overflow: hidden;
}
.wd__item { border-bottom: 0.5px solid var(--line); }
.wd__item:last-child { border-bottom: none; }

.wd__row {
  display: flex; align-items: center; width: 100%; gap: 14px;
  padding: 14px 16px; background: transparent; border: none; cursor: pointer;
  font-family: var(--body); text-align: left;
}
.wd__row.open { padding-bottom: 8px; }

.wd__glyph {
  width: 40px; height: 40px; border-radius: 12px; flex: none;
  display: flex; align-items: center; justify-content: center; line-height: 1;
}
.wd__glyph--astro {
  font-family: var(--astro); font-size: 22px;
  background: var(--paper); color: var(--ink);
}
.wd__glyph--symbol {
  font-family: serif; font-size: 20px;
  background: var(--paper); color: var(--ink);
}
.wd__glyph--number {
  font-family: var(--display); font-size: 18px;
  background: var(--ink); color: #F1ECDF;
}

.wd__row-title { font-size: 17px; line-height: 1.2; }
.wd__row-meta { font-size: 10.5px; color: var(--muted); letter-spacing: 0.3px; margin-top: 3px; }
.wd__chev { width: 16px; height: 16px; color: var(--muted); flex: none; transition: transform 0.24s; }
.wd__chev.open { transform: rotate(180deg); }

.wd__essence {
  padding: 0 16px 14px 70px; font-size: 13px; color: var(--ink-2); line-height: 1.45;
}
.wd__list--plain .wd__essence { padding-left: 16px; }
.wd__body { padding: 2px 18px 18px; overflow: hidden; }

/* expand transition */
.wd-expand-enter-active, .wd-expand-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}
.wd-expand-enter-from, .wd-expand-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── Prosa (gleiches Styling wie ReadingArticle) ── */
.ra__prose { font-size: 14.5px; line-height: 1.7; color: var(--ink-2); }
.ra__prose :deep(p) { margin: 0 0 12px; }
.ra__prose :deep(p:last-child) { margin-bottom: 0; }
.ra__prose :deep(strong) { color: var(--ink); font-weight: 600; }
.ra__prose :deep(em) { font-style: italic; }
.ra__prose :deep(.md-key) {
  font-family: var(--display); font-size: 17px; line-height: 1.35; color: var(--ink);
  padding: 2px 0 2px 14px; margin: 0 0 14px; border-left: 2px solid var(--gold);
}
.ra__prose :deep(ul) {
  margin: 4px 0 14px; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 7px;
}
.ra__prose :deep(li) { position: relative; padding-left: 20px; line-height: 1.5; }
.ra__prose :deep(ul li)::before {
  content: ""; position: absolute; left: 3px; top: 9px;
  width: 5px; height: 5px; border-radius: 50%; background: var(--gold);
}
</style>
