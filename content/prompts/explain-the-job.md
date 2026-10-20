---
title: Explain a job to a customer in plain words
description: Your notes make sense to you, not always to the customer. Paste your notes from the call or site visit, confirm the numbers, and get a plain-words email, plus a PDF quote if you run it in your Quotes Project.
category: Customer messages
audience: Trades and technical services
prompts:
  - label: Paste it, then paste your call notes under it
    text: |-
      You help me explain a job to a customer in plain words. I'll paste my notes from a call or site visit with them under this prompt: Granola notes, or any call or meeting notes. You write the email. I decide when it goes.

      ## Ground rules

      - Never send an email and never contact my customer yourself. You only write drafts.
      - Never invent a number or a piece of scope. Every price, quantity, measurement, date and number of hours you use is either clearly in my notes or confirmed by me. Never round a number off.
      - If something in the notes is unclear, say so and ask me. Don't guess.

      ## Step 1: Read the notes

      Pull these from the notes:
      - the customer's name and email, if they're there
      - what the customer asked for
      - what was found
      - what the work involves
      - the options we talked about, if any
      - timing
      - anything the customer was worried about

      Then show me what you found as a short list.

      ## Step 2: Confirm the numbers

      List every number the job depends on: prices, quantities, measurements, dates, hours. Mark each one as clear, missing, unclear, or contradicted somewhere else in the notes. Ask me to confirm or fill in every one that isn't clear, plus the customer's email if it's missing.

      Wait for my answers before you write anything.

      ## Step 3: Write the email

      Write a short email to the customer, in plain words:
      - what we found;
      - what we'll do, and why;
      - the options, if there are any;
      - what it costs, using only confirmed numbers;
      - timing;
      - the next step.

      No jargon. When a trade term is needed, explain it in a few words. A subject line, and a body of 150 words or fewer, warm and direct. Answer what the customer was worried about, if anything. Sign off with my business name, unless I give you my own name. If you'll make a quote in Step 4, say the quote is attached.

      ## Step 4: The quote, if you're in my Quotes Project

      Check whether this chat is inside my Quotes Project: a project whose instructions and files include my price list and my business details.

      **If it is:** make the quote as a downloadable PDF.
      - Line items come from the confirmed scope and the prices in my price list. If something isn't in the price list, ask me. Don't estimate.
      - Include my business name and details, the customer, today's date (ask me if you don't know it), a quote number if I give you one, and the total.
      - Add a valid-until date only if my Project's instructions or terms set one.
      - If you can't create files here, give me the quote as a clean, printable page I can save as a PDF from the browser's print dialog, and tell me that's what you did.

      **If it isn't:** skip the quote, and say in one line: "Run this in your Quotes Project to get the quote as a PDF too."

      ## Step 5: Get it into my email

      Check whether this chat actually has an email tool that can create drafts, such as a Gmail or Outlook connector. Don't assume it does. If you're not sure, treat it as not connected.

      **If it's connected:**
      1. Show me the To address, the subject and the body first, and wait for my yes.
      2. Then create a draft. Never send it.
         - Address it to the customer's email.
         - If you can find an existing email thread with this customer, create the draft as a reply in that thread.
         - If you made a PDF quote and the tool supports attachments, attach it. If it doesn't, tell me plainly that I need to attach the PDF myself.
      3. Tell me where you saved the draft, so I can find it, read it and send it.

      **If it's not connected:**
      1. Say so in one line.
      2. Give me the To address, the subject and the body, each in its own block so I can copy them.
      3. Add one line: connecting Gmail or Outlook to this chat lets you create the draft for me next time.

      If I ask for changes, rewrite it and show me again before you touch the draft.
steps:
  - "Run Granola (free) on the call or site visit with the customer, so the notes write themselves. Tell the customer you're taking notes, or ask first."
  - "Copy the notes from Granola. Notes from any other call or meeting tool work too."
  - "Paste the prompt and your notes into a new chat. Or paste them into your Quotes Project to get the PDF quote too."
  - "Confirm any numbers it asks about. It won't guess a price, a measurement or a date."
  - "Review the email: it's a draft in your email if Gmail or Outlook is connected, otherwise copy it. Check the PDF quote too, if you got one."
check: Check every number and the scope before it goes out. A plain-words email with the wrong price is worse than jargon.
builtVersion: The one CCM Labs builds writes the explanation straight from your job record, so it goes out with the quote without retyping anything.
date: 2026-10-16T12:00:00Z
draft: false
---

**What you get depends on where you run it:**

- **Gmail or Outlook connected:** the email is saved as a draft in your inbox, as a reply to the customer if you've written to them before. Nothing gets sent.
- **No email connected:** you get the address, subject and message, ready to copy.
- **In your Quotes Project:** you also get the quote as a PDF, priced from your own price list. No Quotes Project yet? [Set one up first](/prompts/quote-assistant).
- **In a plain chat:** you get the email, without the quote.
