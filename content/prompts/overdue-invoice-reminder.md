---
title: Chase an overdue invoice without the awkwardness
description: Nobody likes asking to be paid. Paste the invoice link or attach the PDF, answer two questions, and get a reminder in the right tone, saved as a draft in your email or ready to copy.
category: Admin
audience: Any business that invoices
prompts:
  - label: Paste it, then add your invoice link or PDF
    text: |-
      You help me chase an unpaid invoice. I'll give you a link to the invoice (Stripe, QuickBooks, Wave, FreshBooks, Xero, Square or similar), or attach it as a PDF, a screenshot or a photo. You write the reminder. I decide when it goes.

      ## Ground rules

      - Never send an email, never change the invoice, and never contact my client yourself. You only write drafts.
      - Use only what's on the invoice and what I tell you. Never invent a late fee, a deadline or a threat that isn't printed on the invoice.
      - If something is unclear or missing, say so. Don't guess.

      ## Step 1: Read the invoice

      Pull these from the invoice:
      - my business name, as it appears on the invoice
      - the client's name and contact email
      - invoice number
      - amount and currency
      - issue date and due date
      - days overdue, worked out from today's date (if you don't know today's date, ask me)
      - what the work was for
      - the payment link or payment methods
      - any late-fee or interest terms printed on the invoice

      If the link won't open, or opens but shows no invoice details (common with payment pages that load with scripts), tell me in one line and ask for the PDF or a screenshot instead.

      Then show me what you found as a short list. Ask me only for what's missing, plus these two questions:
      1. How many reminders have I already sent for this invoice? (0 if none.)
      2. How well do I know this client? A new client, a regular, or someone I've worked with for years?

      Wait for my answers before you write anything.

      ## Step 2: Write the reminder

      Pick the tone from the number of reminders already sent:
      - None: a friendly nudge. Assume it slipped their mind.
      - One: clear and firm. Say the invoice is now overdue and ask them to pay, or to tell me when they will.
      - Two or more: a final notice. Say plainly that this is the final reminder and ask them to pay or reply to sort it out. Mention late fees or interest only if the invoice states them, and quote the terms exactly.

      Use how well I know the client to set the warmth: first name and a lighter touch for someone I know well, a little more formal for someone new.

      Every version:
      - mentions the invoice number, the amount with currency, the due date and the payment link (or the payment methods if there's no link);
      - is short: a subject line and a body of 120 words or fewer;
      - has no grovelling, no guilt-tripping and no apologising for asking to be paid;
      - signs off with my business name from the invoice, unless I give you my own name.

      Write the subject like this: "Invoice <number>: <amount> due <due date>". Add "Reminder" or "Final reminder" at the front for the second and later reminders.

      ## Step 3: Get it into my email

      Check whether this chat actually has an email tool that can create drafts, such as a Gmail or Outlook connector. Don't assume it does. If you're not sure, treat it as not connected.

      **If it's connected:**
      1. Show me the To address, the subject and the body first, and wait for my yes.
      2. Then create a draft. Never send it.
         - Address it to the client's email from the invoice.
         - If you can find an existing email thread with this client about this invoice, create the draft as a reply in that thread.
         - If I attached the invoice PDF and the tool supports attachments, attach it. Otherwise put the invoice link in the body, and tell me plainly that I need to attach the PDF myself.
      3. Tell me where you saved the draft, so I can find it, read it and send it.

      **If it's not connected:**
      1. Say so in one line.
      2. Give me the To address, the subject and the body, each in its own block so I can copy them.
      3. Add one line: connecting Gmail or Outlook to this chat lets you create the draft for me next time.

      If I ask for changes, rewrite it and show me again before you touch the draft.
steps:
  - "Check the invoice really is unpaid. Look at your bank, not just your invoicing tool."
  - "Copy the prompt into a new chat and paste the invoice link, or attach the PDF. A screenshot works too."
  - "Check what it read from the invoice, then answer two questions: how many reminders you've already sent, and how well you know the client."
  - "If Gmail or Outlook is connected to the chat, it saves a draft in your email. If not, you get the address, subject and message ready to copy."
  - "Read it and send it yourself. If they answer with a problem, deal with the problem. Don't send the next reminder on autopilot."
check: It only writes drafts, so nothing goes out until you send it. You know if there's a reason they're late, and the AI doesn't.
builtVersion: The one CCM Labs builds checks your invoices against your bank and drafts the reminder when one goes overdue, ready for you to approve.
date: 2026-10-16T12:00:00Z
draft: false
---
