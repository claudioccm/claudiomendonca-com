<!--
  Copy control for one prompt (/prompts/<slug>). The prompt text is never
  rendered (Claudio, 2026-10-16): the page explains what the prompt does and
  this button puts the text on the clipboard. Fires GA4 `prompt_copy` on a
  successful copy.
-->
<script setup lang="ts">
interface Props {
  text: string
  label?: string
  slug: string
  category: string
  /** 1-based position on the page, sent as `prompt_part`. */
  part: number
}

const props = defineProps<Props>()

// Tell people to fill in the brackets after pasting, without showing the text.
const hasPlaceholders = computed(() => splitPlaceholders(props.text).some(s => s.placeholder))
const status = ref<'idle' | 'copied' | 'error'>('idle')
let resetTimer: ReturnType<typeof setTimeout> | null = null

async function copy() {
  const ok = await copyText(props.text)
  status.value = ok ? 'copied' : 'error'
  if (ok) trackPromptCopy(props.slug, props.category, props.part)
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    status.value = 'idle'
  }, 2500)
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <div class="prompt-copy">
    <div class="prompt-copy__text">
      <p class="prompt-copy__label">{{ label || 'The prompt' }}</p>
      <p v-if="hasPlaceholders" class="prompt-copy__note mono">
        After you paste it, swap the parts in [brackets] for your own details.
      </p>
    </div>
    <button
      type="button"
      class="btn btn-filled prompt-copy__btn"
      :class="{ 'is-copied': status === 'copied' }"
      :aria-label="label ? `Copy prompt: ${label}` : 'Copy prompt'"
      @click="copy"
    >
      {{ status === 'copied' ? 'Copied' : 'Copy prompt' }}
    </button>
    <p class="sr-only" aria-live="polite">
      {{ status === 'copied' ? 'Prompt copied to clipboard.' : status === 'error' ? 'Couldn’t copy. Please try again.' : '' }}
    </p>
    <p v-if="status === 'error'" class="prompt-copy__error mono" aria-hidden="true">
      Couldn’t copy. Please try again.
    </p>
  </div>
</template>
