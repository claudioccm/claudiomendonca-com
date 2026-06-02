<!--
  Static three-step engagement section for /consulting (PRO-78 U4, K4).
  Markup-driven — no props, no state. The engagement model is a single
  fixed Audit → Build → Run it shape that is identical across offerings,
  so a data-driven API is unjustified surface (see plan K4).

  Reframed to the AI Services Studio strategy (PRO-91, Draft 3): Care & R&D
  is the ongoing product and lives inside step 03 ("Run it") rather than as
  a peer offering. The section carries `id="how"` so the hero ghost CTA can
  deep-link to it.
-->
<template>
  <section id="how" data-screen-label="Consulting — How it works">
    <div class="shell">
      <div class="section-head">
        <span class="label">Engagement</span>
        <h2>How it works.</h2>
      </div>
      <div class="steps">
        <div class="step">
          <span class="num">01</span>
          <h4>Audit.</h4>
          <p>
            A short, paid audit. We agree on the problem, the one outcome
            that matters, and a fixed price, before any build starts.
          </p>
        </div>
        <div class="step">
          <span class="num">02</span>
          <h4>Build.</h4>
          <p>
            Hands-on delivery in your repo and tools. Short cycles, weekly
            checkpoints, no surprises at the final review. A human signs off
            on what ships.
          </p>
        </div>
        <div class="step">
          <span class="num">03</span>
          <h4>Run it.</h4>
          <p>
            Your team owns the system and the docs. Most keep me on a Care &amp;
            R&amp;D retainer to maintain it, handle the edge cases, and automate
            the next thing. The build is the start, not the finish.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
