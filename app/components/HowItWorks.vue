<!--
  Static three-step engagement section for /consulting (PRO-78 U4, K4).
  Markup-driven — no props, no state. The engagement model is a single
  fixed Scope → Build → Handover shape that is identical across offerings,
  so a data-driven API is unjustified surface (see plan K4).

  Markup lifted from _process/prototype/consulting.html lines 189–230,
  with the prototype's inline-styled <span class="label"> replaced by the
  bare class (the new global .label rule in sections.css supplies the
  prototype's eyebrow look — PRO-78 K2).
-->
<template>
  <section data-screen-label="Consulting — How it works">
    <div class="shell">
      <div class="section-head">
        <span class="label">Engagement</span>
        <h2>How it works.</h2>
      </div>
      <div class="steps">
        <div class="step">
          <span class="num">01</span>
          <h4>Scope.</h4>
          <p>
            A short, paid scoping engagement. We agree on the problem, the
            shape of the solution, and what "done" looks like before any
            build starts.
          </p>
        </div>
        <div class="step">
          <span class="num">02</span>
          <h4>Build.</h4>
          <p>
            Hands-on delivery, working in your repo and tools. Short
            feedback cycles, weekly checkpoints, no surprises in the final
            review.
          </p>
        </div>
        <div class="step">
          <span class="num">03</span>
          <h4>Handover.</h4>
          <p>
            The system, the docs, and the eval loop are yours. Optional
            ongoing support is available, but the goal is your team operating
            it without me.
          </p>
        </div>
      </div>
      <p class="t-caption faint" style="margin-top: 48px;">
        <span class="todo">TODO(claudio):</span>
        Confirm engagement model. Pricing intentionally not shown on the page.
      </p>
    </div>
  </section>
</template>
