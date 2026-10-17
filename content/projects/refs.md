---
title: _refs
seoTitle: "_refs: a free, local library for design references"
tagline: A local library for design references, built for designers and the agents they work with.
description: A free, open-source library for design references. Boards and briefs as plain files on your own machine, ready for your coding agent to read.
repo: https://github.com/ccmdesign/refs
licence: MIT
agentPrompt:
  label: Install _refs
  note: Paste it into Claude Code, Codex, Cursor or any coding agent.
  buttonLabel: Give this to your agent
  text: |-
    Install _refs for me. It is a local library for design references: https://github.com/ccmdesign/refs

    1. Ask me which folder to put it in, unless I already said. Clone https://github.com/ccmdesign/refs there.
    2. Open AGENTS.md in the repository and follow it step by step. It is the source of truth: if anything here disagrees with it, AGENTS.md wins.
    3. It needs Node 22.18 or newer, and pnpm through `corepack enable`. If my Node is older, stop and tell me. Don't install Node yourself.
    4. Ask me before anything optional: image tagging (and which tagger) and the agent skill. Never choose a paid, hosted tagger unless I ask for one. Never invent an API key, write one into a file, or ask me to paste one into the chat.
    5. If a step fails, run `pnpm refs doctor` in the app folder, fix what it reports, and run it again.
    6. When it works, start the app with `pnpm dev` and tell me the URL (http://localhost:3210 unless REFS_PORT is set).
cta:
  heading: Want a tool shaped around your work?
  body: I build focused software for small businesses, shaped around the way your team already works. Tell me the task that keeps coming back. If a free tip fixes it, you’ll hear that first.
date: 2026-10-17T00:00:00Z
---

I built _refs for designers who work with coding agents. You collect images and links onto boards in a plain web app, and give each board a short brief: what it is for, what to take from it, what to ignore.

Every board is also saved as a folder of images plus one `refs.yaml` holding the brief and your notes. Point your agent at that folder and it has what it needs to start a design.

- Plain files on your own machine. No account, no database, no server to rent.
- Boards nest, and one image can sit on many boards with a different note on each.
- An Agent button on every board copies a prompt with the right paths, ready to paste.
- Optional image tagging with a vision model you choose. It is off by default.

It is free and open source under the MIT licence.
