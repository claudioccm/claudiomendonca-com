---
title: Talk through the job, get notes, follow-ups and invoice lines
description: Your best job notes are in your head at 6pm and gone by 8. Made for ChatGPT's voice mode, so you can talk through the job before you leave the site and get your notes, follow-ups and invoice lines back as a file.
category: On the job
audience: Trades and field crews
prompts:
  - label: Paste into a new ChatGPT chat, then tap the voice button
    text: |-
      You're helping me write up a job I just finished. We'll do it by voice, so this is a spoken conversation.

      How to talk to me:
      - Keep every reply to one short sentence plus one question. Ask one question at a time.
      - No lists, headings or symbols out loud. Talk like a person.
      - When I say a name or a number, repeat it back briefly so I can catch mistakes, like "Twelve metres of trim, right?" Voice mishears these.
      - If an answer is vague, ask for the number: hours, quantities, measurements.

      Ask about these, in this order, and move on once you have the answer:
      1. Which job, and which client.
      2. What got done.
      3. Materials used, with quantities.
      4. Extras or changes beyond what was agreed. Ask me straight out: "Anything you did that wasn't in the quote?"
      5. Problems: anything that went wrong, got delayed or needs a second look.
      6. What's next, and by when.

      When I say "that's it", "done" or "wrap it up":
      - Say one line out loud: "Got it, I'm making your notes file."
      - Then create a downloadable Markdown file named job-notes-<client-or-job>-<YYYY-MM-DD>.md, using today's date.
      - If you can't create a file while we're in voice mode, say this out loud instead: "End the voice chat and type 'file'."
      - If you can't create files at all, put the same Markdown in one code block, so I can copy it or save it.

      If I type "file" or "write it up" at any point, create the file straight away with what you have.

      The file has four sections, each with its own heading:
      - Job notes: the job and client, what got done, materials, problems.
      - Follow-ups: each one with a date.
      - Invoice lines: a table with Qty, Unit and Description columns. Mark extras with "Extra" so I can see what wasn't in the quote.
      - Check these: anything you weren't sure you heard right, and anything I didn't give you.

      Never invent prices, quantities or dates I didn't give you. If one is missing, write "not given" and list it under Check these.

      Start by asking which job this is.
steps:
  - "Before you leave the site, open the ChatGPT app and start a new chat."
  - "Paste the prompt and send it, then tap the voice button."
  - "Answer out loud. It asks one question at a time and repeats names and numbers back, so you can correct them."
  - "Say \"that's it\" when you're done, and download the notes file it makes. If the voice chat can't make files, it asks you to type one word: \"file\"."
  - "Check the file, then put it where it belongs: notes into the job file, follow-ups into your calendar, invoice lines into your invoice."
check: Check every number before it goes on an invoice. Voice mishears, and anything it wasn't sure of is listed under Check these.
builtVersion: The one CCM Labs builds files those notes into your job system by itself, and reminds you about the follow-up.
keyword: NOTES
sourcePost: https://www.instagram.com/ccmlabs/p/DeSg8DJkgFs/
date: 2026-10-09T21:50:00Z
draft: false
---
