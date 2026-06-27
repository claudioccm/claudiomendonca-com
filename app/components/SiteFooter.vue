<!--
  Static four-column footer. No state, no lifecycle. Markup pattern from
  _process/prototype/consulting.html lines 255–301 (preferred over the
  index.html version, which has empty <a> placeholders).
-->
<template>
  <footer id="contact" class="footer">
    <div class="shell">
      <div class="footer-grid">
        <!-- Brand column -->
        <div class="footer-brand">
          <NuxtLink to="/" class="wordmark" aria-current-value="false">
            <span class="ast" aria-hidden="true">✱</span>
            <span>Claudio Mendonça</span>
          </NuxtLink>
          <p class="t-body ash tagline">
            AI experiments, and a small consulting practice.
          </p>
        </div>

        <!-- Site links -->
        <div>
          <h2>Site</h2>
          <ul>
            <li><a href="/#work">Experiments</a></li>
            <li><a href="/writing">Writing</a></li>
            <li><a href="/consulting">Consulting</a></li>
            <li><a href="/#about">About</a></li>
          </ul>
        </div>

        <!-- Contact links -->
        <div>
          <h2>Contact</h2>
          <ul>
            <li><a href="#" rel="noopener">GitHub</a></li>
            <li><a href="#" rel="noopener">X / Twitter</a></li>
          </ul>
        </div>

        <!-- Elsewhere links -->
        <div>
          <h2>Elsewhere</h2>
          <ul>
            <li><a href="https://ccmdesign.com" target="_blank" rel="noopener">ccmdesign ↗</a></li>
            <li><a href="https://varro.me" target="_blank" rel="noopener">Varro ↗</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-meta">
        <div>© 2026 Claudio Mendonça. All rights reserved.</div>
        <div class="glyph" aria-hidden="true">✱</div>
      </div>
    </div>
  </footer>
</template>
