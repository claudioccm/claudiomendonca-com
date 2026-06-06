<!--
  Dev-only tuning panel for the hero TypewriterHeadline effect. Rendered by
  index.vue ONLY when the URL has a `?tune` query param, so normal visitors
  never see it (works on local dev AND the deployed Netlify dev preview).

  It mutates the shared reactive `config` object passed in, which is also bound
  to <TypewriterHeadline>'s props — so dragging a slider retunes the live effect
  (type/delete speed and cursor blink apply immediately; hold/between apply on the
  next cycle). "Copy values" puts the current config on the clipboard so the
  chosen numbers can be baked in as defaults.
-->
<script setup lang="ts">
interface TuneConfig {
  typeMs: number
  deleteMs: number
  holdMs: number
  betweenMs: number
  cursorBlinkMs: number
}

const config = defineModel<TuneConfig>('config', { required: true })

const DEFAULTS: TuneConfig = {
  typeMs: 90,
  deleteMs: 45,
  holdMs: 1600,
  betweenMs: 400,
  cursorBlinkMs: 1050,
}

const sliders = [
  { key: 'typeMs', label: 'Type speed (ms/char)', min: 10, max: 300, step: 5 },
  { key: 'deleteMs', label: 'Delete speed (ms/char)', min: 10, max: 300, step: 5 },
  { key: 'holdMs', label: 'Hold full word (ms)', min: 200, max: 4000, step: 50 },
  { key: 'betweenMs', label: 'Pause between (ms)', min: 0, max: 1500, step: 50 },
  { key: 'cursorBlinkMs', label: 'Cursor blink (ms)', min: 300, max: 2000, step: 50 },
] as const

const copied = ref(false)
function copy() {
  const c = config.value
  const text = `typeMs: ${c.typeMs},\ndeleteMs: ${c.deleteMs},\nholdMs: ${c.holdMs},\nbetweenMs: ${c.betweenMs},\ncursorBlinkMs: ${c.cursorBlinkMs},`
  navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1200)
}

function reset() {
  Object.assign(config.value, DEFAULTS)
}
</script>

<template>
  <aside class="tuner" aria-label="Typewriter effect tuner">
    <div class="tuner-head">
      <strong>Typewriter tuner</strong>
      <span class="tuner-hint">?tune</span>
    </div>
    <label v-for="s in sliders" :key="s.key" class="tuner-row">
      <span class="tuner-label">{{ s.label }}</span>
      <input
        v-model.number="config[s.key]"
        type="range"
        :min="s.min"
        :max="s.max"
        :step="s.step"
      >
      <output class="tuner-val">{{ config[s.key] }}</output>
    </label>
    <div class="tuner-actions">
      <button type="button" @click="copy">{{ copied ? 'Copied!' : 'Copy values' }}</button>
      <button type="button" @click="reset">Reset</button>
    </div>
  </aside>
</template>

<style scoped>
.tuner {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9999;
  width: 280px;
  padding: 14px 16px;
  background: rgba(20, 20, 20, 0.92);
  color: #fff;
  border-radius: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.4;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}
.tuner-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}
.tuner-hint {
  opacity: 0.5;
  font-size: 10px;
}
.tuner-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px 8px;
  margin-bottom: 10px;
}
.tuner-label {
  grid-column: 1 / -1;
  opacity: 0.8;
}
.tuner-row input[type='range'] {
  width: 100%;
  accent-color: #fff;
}
.tuner-val {
  min-width: 44px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.tuner-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.tuner-actions button {
  flex: 1;
  padding: 6px 8px;
  background: #fff;
  color: #141414;
  border: 0;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}
.tuner-actions button:hover {
  opacity: 0.85;
}
</style>
