---
title: Find the subscriptions you forgot you're paying for
description: Upload a credit card statement (PDF, CSV or photo) and the AI finds your recurring subscriptions, then builds a small page where you mark each one Keep, Cancel or Review. Review looks up charges you don't recognize; Cancel gets you step-by-step instructions, or browser help on plans that have it. It works on the free plans of Claude, ChatGPT and Gemini.
category: Admin
audience: Anyone with a business or personal card
prompts:
  - label: Paste it, then attach your statement
    text: |-
      You are my subscription auditor. I will attach one or more credit card statements: a PDF, a CSV, or a photo or screenshot. Your job is to find every recurring subscription, show them to me in a small interactive page, and then act on what I decide.

      ## Ground rules

      - Never repeat my full card number, account number or address back to me. Refer to the card by its last 4 digits at most.
      - You never cancel anything, sign in, enter passwords or payment details, accept offers, or click a final "confirm" without my explicit yes in this chat. Clicking a button in the page counts as a request, not as that yes.
      - If something is unclear (a blurry photo, a cut-off page, a merchant name you can't place), say so. Don't guess silently.
      - Keep chat replies short. The page does the talking.

      ## Step 1: Find the subscriptions

      1. Read every transaction. If the image or file is unreadable, tell me which part and stop.
      2. Mark a charge as a subscription if **any** of these hold:
         - The same merchant charges a similar amount in more than one month, when I've given you more than one statement.
         - The merchant is a known subscription business: streaming, software/SaaS, cloud storage, apps, news, gyms, memberships, phone or internet, insurance, meal kits, and so on.
         - The descriptor looks like a recurring billing pattern, e.g. `APPLE.COM/BILL`, `GOOGLE *`, `PAYPAL *`, `AMZN DIGITAL`, `*SUBSCRIPTION`, `RECURRING`, `MEMBERSHIP`.
         - It's an annual or quarterly charge for something that's normally a subscription.
      3. Don't count one-off purchases, refunds, transfers, interest or fees. If a refund cancels out a subscription charge, mention it in that item's notes.
      4. Charges billed through Apple, Google, PayPal or Amazon often hide the real service. List each one and say the real service can't be seen from the statement.
      5. If I gave only one month, tell me in one line that sending 2–3 months would catch more, then continue.

      For each subscription, record:

      | field | meaning |
      |---|---|
      | `id` | short slug, unique |
      | `merchant` | clean name, e.g. "Netflix" |
      | `descriptor` | the raw statement text |
      | `amount` | number, per charge |
      | `currency` | e.g. "USD" |
      | `cadence` | "monthly", "annual", "quarterly", "weekly" or "unknown" |
      | `monthly_equiv` | amount converted to per-month |
      | `last_charge` | date, YYYY-MM-DD |
      | `category` | e.g. "Streaming", "Software", "Fitness" |
      | `what_it_is` | one plain sentence |
      | `confidence` | "high", "medium" or "low" that this is a subscription |
      | `status` | always "undecided" at this stage |
      | `details` | empty for now |
      | `notes` | anything odd: price change, duplicate, refund |

      ## Step 2: Build the page

      Make **one self-contained HTML file**, with inline CSS and JS and no external libraries, fonts or network calls. If this app can render HTML (Claude Artifacts, ChatGPT Canvas, Gemini Canvas), render it there. Otherwise put it in a single code block that I can save as `subscriptions.html` and open in my browser.

      **Data.** Put all the data in `<script id="audit-state" type="application/json">` as
      `{"version": 1, "audit_id": "<statement period + card last 4>", "round": 1, "can_browse": <true|false>, "items": [...]}`.
      Set `can_browse` to `true` only if this chat actually gives you a tool that can open and click websites. Otherwise set it to `false`. The page renders everything from this data and nothing else.

      **Layout:**
      - If `can_browse` is `false`, put a clearly visible notice directly under the header. It isn't an error, so style it calmly. Use exactly this text: "This chat can't control a browser (free plans usually can't), so the assistant can't cancel subscriptions for you. When you mark something Cancel, you'll get step-by-step instructions for cancelling it yourself."
      - Header: the statement period, the number of subscriptions, the total per month and per year, and "potential savings": the total of every item marked Cancel.
      - One card per subscription, sorted by `monthly_equiv` from highest to lowest. Each card shows the merchant, amount and cadence, category, `what_it_is`, a confidence badge (low confidence looks visibly different), and the notes.
      - Each card has three buttons: **Keep**, **Cancel** and **Review**. Clicking one sets the item's `status`, highlights the chosen button and updates the totals. Clicking it again sets the item back to "undecided".
      - Works on a phone. Readable in light and dark mode.

      **Saving.** The page must not lose my decisions:
      - On every change, save the full state to `localStorage` under `subaudit:<audit_id>`. Wrap every read and write in `try/catch`, because some chat apps block storage.
      - On load, if saved state exists for this `audit_id`, the saved statuses win over the embedded ones.
      - If storage is blocked, show a small notice: "Storage is off here. Use the button below to keep your progress."

      **Hand-off to you.** The page can't message you directly. So at the bottom, add a sticky bar with a button labelled **"Send my choices to the assistant"**. When I click it, the page:
      1. Builds this text:
         ```
         SUBSCRIPTION AUDIT — ROUND <n>
         CANCEL: <merchant>, <merchant>, ...
         REVIEW: <merchant>, <merchant>, ...
         KEEP: <merchant>, ...
         STATE: <the full state JSON on one line>
         ```
      2. Tries to copy it to the clipboard. Whether that works or not, it also shows the text in a read-only textarea, with everything selected, so I can copy it by hand.
      3. Tells me: "Paste this into the chat."

      Keep the button disabled until at least one item is marked Cancel or Review.

      After the page, write one line in the chat: "Mark each subscription, then click **Send my choices to the assistant** and paste the result here."

      ## Step 3: When I paste a `SUBSCRIPTION AUDIT` message

      Treat the `STATE` JSON as the source of truth. It lets you carry on even in a fresh chat. Then handle the two lists.

      ### Review items

      1. Search the web for each descriptor and merchant. Find out who actually bills it, what the product is, the typical price, and how to cancel it.
      2. Fill `details` with 3–5 short sentences:
         - what the service is;
         - why it might be on my card (e.g. a free trial that converted, a bundle, an app-store purchase, a family plan);
         - whether the price looks normal or has gone up;
         - what I lose if I cancel;
         - the official cancellation page, if you found one.

         Name your source. If you still can't identify the charge, say so plainly. Suggest I check my email for the merchant's name, or ask my card issuer.
      3. Set these items back to "undecided" and increase `round` by 1.
      4. Build the page again with these changes:
         - Only the items still to decide (the reviewed ones and any still "undecided") appear as full cards. Each card shows the longer `details`.
         - Those cards have **Keep** and **Cancel** only. There's no Review button.
         - Keep and Cancel items from earlier rounds are listed in a collapsed "Already decided" section. They stay in the state and the totals.
         - The hand-off text uses the new round number.

      ### Cancel items

      For each one, in order:

      1. Find the official way to cancel: the direct account or billing URL, the steps, and whether it has to go through Apple, Google, PayPal or Amazon instead of the merchant.
      2. **If you have a browser or agent tool here** (for example ChatGPT agent mode, Claude in Chrome, or Gemini's agent):
         - tell me which service you're starting on, and open its cancellation page;
         - when a login appears, stop and let me sign in myself;
         - go through the cancellation flow, turning down retention offers;
         - **stop before the final confirmation**, and before anything that involves a fee, an early-termination charge, deleting the account or losing data. Tell me exactly what the screen says, and wait for my yes.
      3. **If you have no browser tool** (most free plans): give me a short cancellation card for each service:
         - the direct link;
         - numbered steps;
         - what to expect (retention offers, the date access ends, any fee);
         - if the only way to cancel is by email or chat, a short message I can send myself.
      4. Set each item's `status` to "cancel requested", and add the date you gave me the steps.
      5. Give me the page again with an updated "Cancelling" section. Add a **Done** button to each item there, which changes its status to "cancelled". Totals then show the confirmed savings.
         - When `can_browse` is `false`, show each item's cancellation card in this section: the link, the steps, and the email text with a copy button. Keep the notice from Step 2 at the top of the page.

      ### Keep items

      Do nothing with these.

      ## Finally

      Once nothing is undecided or still to cancel, give me a summary of three lines:
      - what I kept, with the monthly total;
      - what I cancelled, with the monthly and yearly savings;
      - anything to watch: annual renewals coming up, or services where cancelling takes effect at the end of the billing period.
steps:
  - "Download a recent credit card statement: a PDF, a CSV or a clear photo. Two or three months catch more than one."
  - "Copy the prompt into a new chat in Claude, ChatGPT or Gemini, and attach the statement."
  - "On the page it builds, mark each subscription Keep, Cancel or Review. Click Send my choices to the assistant and paste the result back into the chat."
  - "Cancel the ones you marked, following the steps it gives you. Nothing gets cancelled without your yes."
check: You're giving an AI company your card statement. Cover the card number and your address first if you'd rather not share them.
date: 2026-10-20T12:00:00Z
draft: true
---
