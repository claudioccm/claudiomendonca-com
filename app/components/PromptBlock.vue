<!--
  One copy-paste prompt in a box with a Copy button (/prompts/<slug>).
  `[BRACKETED]` parts render highlighted; the button copies the raw text.
  Fires the GA4 `prompt_copy` event on a successful copy.
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

const segments = computed(() => splitPlaceholders(props.text))
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
  <figure class="prompt-block">
    <figcaption class="prompt-block__bar">
      <span class="prompt-block__label mono">{{ label || 'The prompt' }}</span>
      <button
        type="button"
        class="prompt-block__copy mono"
        :class="{ 'is-copied': status === 'copied' }"
        :aria-label="label ? `Copy prompt: ${label}` : 'Copy prompt'"
        @click="copy"
      >
        {{ status === 'copied' ? 'Copied' : 'Copy' }}
      </button>
    </figcaption>
    <pre class="prompt-block__text"><template v-for="(segment, i) in segments" :key="i"><mark v-if="segment.placeholder" class="prompt-block__slot">{{ segment.text }}</mark><template v-else>{{ segment.text }}</template></template></pre>
    <p class="sr-only" aria-live="polite">
      {{ status === 'copied' ? 'Prompt copied to clipboard.' : status === 'error' ? 'Couldn’t copy. Select the text and copy it by hand.' : '' }}
    </p>
    <p v-if="status === 'error'" class="prompt-block__error mono" aria-hidden="true">
      Couldn’t copy. Select the text and copy it by hand.
    </p>
  </figure>
</template>
