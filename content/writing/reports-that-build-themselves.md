---
title: Reports that build themselves.
category: Field notes
date: 2026-02-01T00:00:00Z
dek: A walk through one client's weekly report — from a four-hour copy-paste ritual to a system that drafts it overnight.
readingTime: 5
draft: false
featured: false
---

Every Friday, someone on the client's team spent half a day building the same report. Pull the numbers from three dashboards. Paste them into a deck. Write the same kind of summary they wrote last week. Reformat. Send. Four hours, every week, for a document most people skimmed.

## What the ritual was actually made of

When we mapped it, the four hours broke down into maybe twenty minutes of judgment and three and a half hours of mechanical retrieval and formatting. The judgment — what's worth flagging, what's noise — is the part you want a person doing. The retrieval and formatting is the part that should never have been manual.

So we didn't automate the report. We automated the ritual around it.

## The system

A scheduled job now pulls the same three sources overnight, drops the numbers into the same template, and writes a first-pass summary in the team's voice. By the time someone sits down Friday morning, there's a complete draft waiting. They spend twenty minutes on the part that needs a human — adjusting the read, adding the context a dashboard can't — and it goes out before lunch.

The win isn't that AI wrote a report. It's that a person got three and a half hours back, every single week, and the report got _more_ consistent, not less. The boring, repeatable part runs without anyone watching. The judgment stays where it belongs.
