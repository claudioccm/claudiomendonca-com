<!--
  Dev-only tuning panel for the hero ScrambleHeadline effect. Rendered by
  index.vue ONLY when the URL has a `?tune` query param, so normal visitors
  never see it (works on local dev AND the deployed Netlify dev preview).

  It mutates the shared reactive `config` object passed in, which is also bound
  to <ScrambleHeadline>'s props — so dragging a slider retunes the live effect
  (holdMs/scrambleFrames apply on the next cycle; rerollChance and caret blink
  apply immediately). "Copy values" puts the current config on the clipboard so
  the chosen numbers can be baked in as defaults.
-->
<script setup lang="ts">
interface TuneConfig {
  holdMs: number
  scrambleFrames: number
  rerollChance: number
  caretBlinkMs: number
}

const config = defineModel<TuneConfig>('config', { required: true })

const DEFAULTS: TuneConfig = {
  holdMs: 1500,
  scrambleFrames: 14,
  rerollChance: 0.28,
  caretBlinkMs: 1050,
}

const sliders = [
  { key: 'holdMs', label: 'Hold (ms)', min: 200, max: 4000, step: 50 },
  { key: 'scrambleFrames', label: 'Scramble length (frames)', min: 4, max: 40, step: 1 },
  { key: 'rerollChance', label: 'Flicker (re-roll chance)', min: 0, max: 1, step: 0.01 },
  { key: 'caretBlinkMs', label: 'Caret blink (ms)', min: 300, max: 2000, step: 50 },
] as const

const copied = ref(false)
function copy() {
  const c = config.value
  const text = `scrambleFrames: ${c.scrambleFrames},\nholdMs: ${c.holdMs},\nrerollChance: ${c.rerollChance},\ncaretBlinkMs: ${c.caretBlinkMs},`
  navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1200)
}

function reset() {
  Object.assign(config.value, DEFAULTS)
}
</script>

<template>
  <aside class="tuner" aria-label="Scramble effect tuner">
    <div class="tuner-head">
      <strong>Scramble tuner</strong>
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
