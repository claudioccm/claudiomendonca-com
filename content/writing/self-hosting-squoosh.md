---
title: Self-hosting Squoosh.
category: Build log
date: 2026-01-10T00:00:00Z
dek: Why I run my own batch image compressor instead of uploading client assets to someone else's server. A short build log.
readingTime: 5
draft: false
featured: false
---

Squoosh is a great image compressor. The hosted version is also a place I'd rather not send a client's unreleased assets. So I run my own — a batch version that never leaves my machine. Here's the short build log.

## The problem with the easy path

The convenient move is to drag a folder of client images into a web tool and download the compressed versions. The inconvenient truth is that "a web tool" means someone else's server, and "client images" often means work that hasn't shipped yet. For most assets that's fine. For the ones under NDA, it isn't a risk worth taking to save five minutes.

## What I built instead

Squoosh's compression runs in WebAssembly, which means the actual encoding can happen entirely client-side — no upload required. I wrapped that in a small batch interface: point it at a folder, pick the format and quality, and it processes everything locally, in the browser, on my hardware.

- Nothing uploads. The files never leave the machine.
- Batch, not one-at-a-time — the whole folder in one pass.
- Same encoders as upstream Squoosh, so the output quality matches.

## Was it worth it

For a single image, no — the hosted tool is faster to reach. For a recurring need to compress dozens of client assets without sending them anywhere, absolutely. It's a small tool that removes a small, recurring worry, and that's exactly the kind of thing worth self-hosting.
