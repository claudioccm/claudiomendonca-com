<!--
  Three-step engagement section for /consulting (PRO-78 U4, K4).
  Copy is sourced from the `site` content collection (content/site.json
  → consulting.process) via useSiteContent (PRO-176), so the section is the
  single source of truth for the Audit → Build → Run it shape. The step number
  (01/02/03) is presentational and derived from the array position.

  Reframed to the AI Services Studio strategy (PRO-91, Draft 3): Care & R&D
  is the ongoing product and lives inside step 03 ("Run it") rather than as
  a peer offering. The section carries `id="how"` so the hero ghost CTA can
  deep-link to it.
-->
<script setup lang="ts">
const { data: site } = await useSiteContent()
const process = computed(() => site.value?.consulting.process)
</script>

<template>
  <section id="how" data-screen-label="Consulting — How it works">
    <div class="shell">
      <div class="section-head">
        <span class="label">{{ process?.label }}</span>
        <h2>{{ process?.heading }}</h2>
      </div>
      <div class="steps">
        <div v-for="(step, i) in process?.steps" :key="step.title" class="step">
          <span class="num">{{ padIndex(i + 1) }}</span>
          <h3>{{ step.title }}</h3>
          <p>
            {{ step.body }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
