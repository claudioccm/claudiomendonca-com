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
        <div>
          <NuxtLink to="/" class="wordmark" style="font-size: var(--text-subheading);" aria-current-value="false">
            <span class="ast" aria-hidden="true" style="font-size: 28px;">✱</span>
            <span>Claudio Mendonça</span>
          </NuxtLink>
          <p class="t-body ash" style="max-width: 34ch; margin-top: 24px;">
            AI experiments, and a small consulting practice.
          </p>
        </div>

        <!-- Site links -->
        <div>
          <h4>Site</h4>
          <ul>
            <li><a href="/#work">Experiments</a></li>
            <li><a href="/consulting">Consulting</a></li>
            <li><a href="/#about">About</a></li>
          </ul>
        </div>

        <!-- Contact links -->
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:claudioccm@gmail.com">claudioccm@gmail.com</a></li>
            <li><a href="#" rel="noopener">GitHub</a></li>
            <li><a href="#" rel="noopener">X / Twitter</a></li>
          </ul>
        </div>

        <!-- Elsewhere links -->
        <div>
          <h4>Elsewhere</h4>
          <ul>
            <li><a href="https://ccmdesign.com" target="_blank" rel="noopener">ccmdesign ↗</a></li>
            <li><a href="https://squoosh.ccmdesign.com" target="_blank" rel="noopener">Batch Squoosh ↗</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-meta">
        <div>© 2026 Claudio Mendonça. All rights reserved.</div>
        <div class="glyph" aria-hidden="true">✱</div>
        <div>Built with Claude</div>
      </div>
    </div>
  </footer>
</template>
