<template>
  <div class="interp">
    <div v-if="title || $slots.title" class="m-eyebrow interp__eyebrow">
      <slot name="title">{{ title }}</slot>
    </div>

    <div v-if="loading" class="interp__loading">
      <span class="interp__dot" /><span class="interp__dot" /><span class="interp__dot" />
      <span class="interp__loading-text m-mono">Merlin deutet…</span>
    </div>

    <div v-else-if="error" class="interp__error m-mono">{{ error }}</div>

    <!-- content is our own server-generated, HTML-escaped markdown -->
    <div v-else-if="markdown" class="interp__prose" v-html="html" />
  </div>
</template>

<script setup>
import { renderMarkdown } from '~/composables/useMarkdown';

const props = defineProps({
  markdown: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  title: { type: String, default: '' },
});

const html = computed(() => renderMarkdown(props.markdown));
</script>

<style scoped>
.interp__eyebrow { margin-bottom: 8px; }

.interp__loading { display: flex; align-items: center; gap: 6px; padding: 6px 0; }
.interp__dot {
  width: 6px; height: 6px; border-radius: 6px; background: var(--gold);
  animation: interp-bounce 1.2s infinite ease-in-out both;
}
.interp__dot:nth-child(2) { animation-delay: 0.15s; }
.interp__dot:nth-child(3) { animation-delay: 0.3s; }
.interp__loading-text { margin-left: 8px; font-size: 11.5px; color: var(--muted); }
@keyframes interp-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.interp__error { font-size: 12px; color: #b3402f; }

.interp__prose { color: var(--ink); font-size: 14px; line-height: 1.6; }
.interp__prose :deep(h2) {
  font-family: var(--display); font-size: 17px; margin: 16px 0 6px; color: var(--ink);
}
.interp__prose :deep(h2:first-child) { margin-top: 0; }
.interp__prose :deep(h3) {
  font-family: var(--display); font-size: 15px; margin: 12px 0 4px; color: var(--ink);
}
.interp__prose :deep(p) { margin: 0 0 10px; color: var(--ink-2); }
.interp__prose :deep(strong) { color: var(--ink); font-weight: 600; }
.interp__prose :deep(ul) { margin: 0 0 10px; padding-left: 18px; color: var(--ink-2); }
.interp__prose :deep(li) { margin-bottom: 4px; }
</style>
