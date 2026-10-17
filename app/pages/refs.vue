<!-- _refs project page (Claudio, 2026-10-17): what it is, a "Give this to your agent"
     button that copies the install prompt (never rendered, like /prompts), a GitHub
     link and the CTA to /consulting. Copy lives in content/projects/refs.md. -->
<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

const { data: doc } = await useAsyncData(`project-${route.path}`, () =>
  queryCollection('projects').path(projectContentPath(route.path)).first(),
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const project = computed(() => doc.value!)
const slug = computed(() => projectRoute(project.value.path).slice(1))
const repoLabel = computed(() => project.value.repo.replace(/^https:\/\/github\.com\//, ''))

const canonical = computed(() => `https://ccm-labs.ca${projectRoute(project.value.path)}`)
useHead({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        'name': project.value.title,
        'description': project.value.description,
        'url': canonical.value,
        'codeRepository': project.value.repo,
        'license': project.value.licence ? `https://opensource.org/licenses/${project.value.licence}` : undefined,
        'author': { '@id': 'https://ccm-labs.ca/#person' },
      })),
    },
  ],
})
const seoTitle = computed(() => project.value.seoTitle ?? project.value.title)
useSeoMeta({
  title: () => `${seoTitle.value} — CCM Labs`,
  description: () => project.value.description,
  ogTitle: () => seoTitle.value,
  ogDescription: () => project.value.description,
  ogUrl: () => canonical.value,
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => project.value.description,
})
</script>

<template>
  <div>
    <article class="article project-page">
      <div class="article__head">
        <NuxtLink to="/#work" class="article__back mono">← All tools</NuxtLink>

        <div class="article__meta mono">
          <span>Open source</span>
          <span v-if="project.licence">{{ project.licence }} licence</span>
          <span>Free</span>
        </div>

        <h1 class="article__title">{{ project.title }}</h1>
        <p class="article__dek">{{ project.tagline }}</p>
      </div>

      <div class="article__body prompt-page__body">
        <PromptBlock
          :text="project.agentPrompt.text"
          :label="project.agentPrompt.label"
          :note="project.agentPrompt.note"
          :button-label="project.agentPrompt.buttonLabel"
          :slug="`${slug}-install`"
          category="tool"
          :part="1"
        />

        <div class="prose project-page__about">
          <ContentRenderer :value="project" />
        </div>

        <p class="project-page__repo">
          <a :href="project.repo" target="_blank" rel="noopener" class="mono">
            View on GitHub: {{ repoLabel }} <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </article>

    <CtaBanner
      :heading="project.cta.heading"
      :body="project.cta.body"
      cta-label="Start with one thing"
      cta-href="/consulting#contact"
    />
  </div>
</template>
