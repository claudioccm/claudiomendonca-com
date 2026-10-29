<!-- One downloadable skill (/prompts/<slug>, 2026-10-29): what it does, the
     downloads, install steps per app, how to use it, CTA, related prompts.
     Every download click fires GA4 `skill_download` (app/utils/skills.ts). -->
<script setup lang="ts">
import { computed } from 'vue'
import type { SkillsCollectionItem } from '@nuxt/content'

const props = defineProps<{ doc: SkillsCollectionItem }>()

const route = useRoute()
const skill = computed(() => props.doc)
const slug = computed(() => promptSlug(skill.value.path))
const files = computed(() => skillFiles(slug.value))
const firstTrigger = computed(() => skill.value.triggers[0] ?? '')
const hasNotes = computed(() => (skill.value.body?.value?.length ?? 0) > 0)

const { data: related } = await useAsyncData(`prompts-related-${route.path}`, () =>
  queryCollection('prompts')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .limit(3)
    .all(),
)

const ctaBody = computed(() =>
  `${skill.value.builtVersion ?? 'The version I build is connected to your own tools and records, so there is nothing to install.'} Tell me the task that keeps coming back. If a free prompt fixes it, you’ll hear that first.`,
)

const canonical = computed(() => `https://ccm-labs.ca${skill.value.path}`)
useHead({ link: [{ rel: 'canonical', href: canonical.value }] })
useSeoMeta({
  title: () => `${skill.value.title} — Free AI skill — CCM Labs`,
  description: () => skill.value.description,
  ogTitle: () => skill.value.title,
  ogDescription: () => skill.value.description,
  ogUrl: () => canonical.value,
  twitterTitle: () => skill.value.title,
  twitterDescription: () => skill.value.description,
  robots: () => (skill.value.draft ? 'noindex, nofollow' : undefined),
})
</script>

<template>
  <div>
    <article class="article prompt-page">
      <div class="article__head">
        <NuxtLink to="/prompts" class="article__back mono">← All prompts</NuxtLink>

        <div class="article__meta mono">
          <span>Skill</span>
          <span>For: {{ skill.audience }}</span>
          <template v-if="skill.draft">
            <span class="article__sep" aria-hidden="true">/</span>
            <span class="prompt-draft">Draft, not published</span>
          </template>
        </div>

        <h1 class="article__title">{{ skill.title }}</h1>
        <p class="article__dek">{{ skill.description }}</p>
      </div>

      <div class="article__body prompt-page__body">
        <div class="prompt-copy skill-download">
          <div class="prompt-copy__text">
            <p class="prompt-copy__label">The skill</p>
            <p class="prompt-copy__note">
              One instruction file, SKILL.md, in a folder called {{ slug }}. Upload the .zip to
              Claude or ChatGPT, or add SKILL.md to a ChatGPT Project.
            </p>
          </div>
          <div class="skill-download__actions">
            <a
              class="btn btn-filled prompt-copy__btn"
              :href="files.zip"
              :download="`${slug}.zip`"
              @click="trackSkillDownload(slug, 'zip')"
            >Download .zip</a>
            <a
              class="btn btn-ghost prompt-copy__btn"
              :href="files.md"
              download="SKILL.md"
              @click="trackSkillDownload(slug, 'md')"
            >Download SKILL.md</a>
          </div>
          <a
            class="skill-download__view mono"
            :href="files.md"
            target="_blank"
            rel="noopener"
            @click="trackSkillDownload(slug, 'view')"
          >Read the file first <span aria-hidden="true">↗</span></a>
        </div>

        <div class="prompt-page__section">
          <h2 id="install" class="prompt-page__heading">Install it</h2>

          <div class="skill-install">
            <h3 class="skill-install__app">Claude <span class="mono">claude.ai and the desktop app, any plan</span></h3>
            <ol class="prompt-steps">
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">01</span>
                <span>Download the .zip. Don’t unzip it.</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">02</span>
                <span>In Settings, under Capabilities, turn on Code execution and file creation (in some versions it’s called Create and edit files). Skills need it.</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">03</span>
                <span>Go to Customize, then Skills. Click +, then Create skill, then Upload a skill, and pick the .zip.</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">04</span>
                <span>Check it’s switched on in your skills list. Then start a chat and say “{{ firstTrigger }}”.</span>
              </li>
            </ol>
            <p class="skill-install__note">On a Team or Enterprise plan, an owner may need to allow skills first.</p>
          </div>

          <div class="skill-install">
            <h3 class="skill-install__app">Claude Code</h3>
            <ol class="prompt-steps">
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">01</span>
                <span>Unzip it into your skills folder, so the file ends up at <code>~/.claude/skills/{{ slug }}/SKILL.md</code>. From your Downloads folder: <code>unzip {{ slug }}.zip -d ~/.claude/skills</code></span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">02</span>
                <span>Start Claude Code and type <code>/{{ slug }}</code>, or just say “{{ firstTrigger }}”.</span>
              </li>
            </ol>
          </div>

          <div class="skill-install">
            <h3 class="skill-install__app">ChatGPT <span class="mono">Business, Enterprise, Healthcare and Edu</span></h3>
            <ol class="prompt-steps">
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">01</span>
                <span>Download the .zip.</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">02</span>
                <span>In the sidebar, open Plugins, then the Skills tab. Click Create, then Upload from your computer, and pick the .zip.</span>
              </li>
            </ol>
            <p class="skill-install__note">No upload option? Your workspace admin has to allow skill uploads.</p>
          </div>

          <div class="skill-install">
            <h3 class="skill-install__app">ChatGPT <span class="mono">personal plans: Free, Plus, Pro</span></h3>
            <p class="skill-install__note skill-install__note--lead">These plans can’t install skills yet. A Project does the same job.</p>
            <ol class="prompt-steps">
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">01</span>
                <span>Download SKILL.md.</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">02</span>
                <span>In the sidebar, start a new Project for it.</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">03</span>
                <span>Add SKILL.md to the project’s files.</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">04</span>
                <span>In the project’s instructions, write: “Follow the instructions in SKILL.md for every message.”</span>
              </li>
              <li>
                <span class="prompt-steps__n mono" aria-hidden="true">05</span>
                <span>Start your chats inside that project.</span>
              </li>
            </ol>
          </div>

          <p class="skill-install__note">
            Say any of these to switch it on:
            <template v-for="(trigger, i) in skill.triggers" :key="trigger">
              <span v-if="i" aria-hidden="true"> · </span>“{{ trigger }}”
            </template>
          </p>
        </div>

        <div v-if="skill.steps?.length" class="prompt-page__section">
          <h2 id="how-to-use" class="prompt-page__heading">How to use it</h2>
          <ol class="prompt-steps">
            <li v-for="(step, i) in skill.steps" :key="i">
              <span class="prompt-steps__n mono" aria-hidden="true">{{ padIndex(i + 1) }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
        </div>

        <p v-if="skill.check" class="prompt-check">{{ skill.check }}</p>

        <div v-if="hasNotes" class="prose prompt-page__notes">
          <ContentRenderer :value="skill" />
        </div>
      </div>
    </article>

    <CtaBanner
      heading="That’s the DIY version."
      :body="ctaBody"
      cta-label="Start with one thing"
      cta-href="/consulting#contact"
    />

    <section v-if="related?.length" class="writing-grid-section prompt-related">
      <div class="shell">
        <h2 class="writing-grid-section__head">More prompts</h2>
        <div class="prompt-grid-wrap">
          <ul class="prompt-grid" aria-label="More prompts">
            <li v-for="item in related" :key="item.path">
              <PromptCard
                :to="item.path"
                :title="item.title"
                :category="item.category"
                :audience="item.audience"
                :description="item.description"
              />
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
