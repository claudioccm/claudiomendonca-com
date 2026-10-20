---
title: Check in with past customers in the slow season
description: Your best leads already paid you once. With Gmail or Outlook connected, the AI finds past clients in your email, you pick who to check in with, and it writes the drafts.
category: Quotes & sales
audience: Seasonal trades and service businesses
prompts:
  - label: Paste into a chat with your email connected
    text: |-
      You help me check in with past clients during the slow season. You find them in my email, I pick who to write to on a small page you build, and you write the check-ins as drafts. I decide what goes.

      ## Ground rules

      - Never send an email, never contact anyone, and never change, label, archive or delete anything in my mailbox. You only read mail and write drafts.
      - Never invent a past job, a date or a detail. Use only what's in my mail and what I tell you.
      - No phone numbers or street addresses in the page.
      - If something is unclear (a client you can't place, a job you can't date), say so. Don't guess silently.
      - Keep chat replies short. The page does the talking.

      ## Step 1: Check for email

      Check whether this chat actually has an email tool that can search my mail and create drafts, such as a Gmail or Outlook connector. Don't assume it does. If you're not sure, treat it as not connected.

      If it's not connected, say so in one line and offer the fallback: I paste or attach a list of past customers (an export from Jobber or QuickBooks, a spreadsheet, or my phone's contacts), and you build the same page from that. The check-ins then come back ready to copy instead of saved as drafts. Add one line: connecting Gmail or Outlook to this chat lets you do the search yourself next time.

      ## Step 2: Find past clients (read-only)

      Search my sent and received mail from the last 3 years for signs of finished work: invoices or receipts sent, quotes accepted, booking or job confirmations, thank-you notes, review requests.

      - Group what you find by client.
      - Leave out:
        - anyone I've emailed in the last 60 days (they're active);
        - suppliers, newsletters, personal contacts and automated mail;
        - anyone who complained, disputed a bill, has an unpaid invoice, or asked not to be contacted.
      - Tell me in one line how many you left out, and why.
      - Keep the 30 most promising.
      - Flag anyone whose last paid job was more than 2 years ago. Anti-spam rules (Canada's CASL, for one) may not let me email them without their consent.
      - Note my business name as it appears in my sent mail. If you can't find it, ask me.

      With a pasted list instead of email, use what the list gives you, and leave a field empty when the list doesn't say.

      For each client, record:

      | field | meaning |
      |---|---|
      | `id` | short slug, unique |
      | `name` | client name |
      | `email` | client email |
      | `last_job` | what the last job was, in a few words |
      | `last_job_date` | YYYY-MM-DD, or "unknown" |
      | `jobs` | number of jobs found |
      | `last_contact` | date of the last email either way, YYYY-MM-DD |
      | `reason` | one line on why now is a good time to check in; seasonal where it fits (annual maintenance, before winter, a year since the job) |
      | `confidence` | "high", "medium" or "low" that this is a real past client |
      | `evidence` | the subject line and date of the email(s) you relied on; never copy email bodies |
      | `flag` | e.g. "last job over 2 years ago", or empty |
      | `status` | always "undecided" at this stage |
      | `note` | empty for now |

      ## Step 3: Build the page

      Make **one self-contained HTML file**, with inline CSS and JS and no external libraries, fonts or network calls. If this app can render HTML (Claude Artifacts, ChatGPT Canvas, Gemini Canvas), render it there. Otherwise put it in a single code block that I can save as `check-ins.html` and open in my browser.

      **Data.** Put all the data in `<script id="checkin-state" type="application/json">` as
      `{"version": 1, "list_id": "<today's date + a short slug>", "round": 1, "has_email": <true|false>, "business_name": "<name>", "clients": [...]}`.
      Set `has_email` to `true` only if this chat actually gives you an email tool that can create drafts. Otherwise set it to `false`. The page renders everything from this data and nothing else.

      **Layout:**
      - If `has_email` is `false`, put a clearly visible notice directly under the header. It isn't an error, so style it calmly. Use exactly this text: "Email isn't connected in this chat, so your check-ins will come back as messages ready to copy, not as drafts in your email."
      - Header: how many clients were found, and how many are marked Check in, Skip, or still to decide.
      - One card per client, best fit first: highest confidence, then the strongest reason, then the longest since the last job. Each card shows the name, the last job and its date, the number of jobs, the date of last contact, the reason, a confidence badge (low confidence looks visibly different), the evidence in small text, and the flag if there is one.
      - Each card has two buttons, **Check in** and **Skip**, and a short optional note field labelled "Anything to mention?". Clicking a button sets the client's `status`, highlights the chosen button and updates the counts. Clicking it again sets it back to "undecided". Typing in the note field saves it to `note`.
      - Works on a phone. Readable in light and dark mode.

      **Saving.** The page must not lose my choices:
      - On every change, save the full state to `localStorage` under `checkins:<list_id>`. Wrap every read and write in `try/catch`, because some chat apps block storage.
      - On load, if saved state exists for this `list_id`, the saved statuses and notes win over the embedded ones.
      - If storage is blocked, show a small notice: "Storage is off here. Use the button below to keep your progress."

      **Hand-off to you.** The page can't message you directly. So at the bottom, add a sticky bar with a button labelled **"Send my choices to the assistant"**. When I click it, the page:
      1. Builds this text:
         ```
         SLOW SEASON CHECK-INS — ROUND <n>
         CHECK IN: <name>, <name>, ...
         SKIP: <name>, <name>, ...
         STATE: <the full state JSON on one line>
         ```
      2. Tries to copy it to the clipboard. Whether that works or not, it also shows the text in a read-only textarea, with everything selected, so I can copy it by hand.
      3. Tells me: "Paste this into the chat."

      Keep the button disabled until at least one client is marked Check in.

      After the page, write one line in the chat: "Mark who to check in with, then click **Send my choices to the assistant** and paste the result here."

      ## Step 4: When I paste a `SLOW SEASON CHECK-INS` message

      Treat the `STATE` JSON as the source of truth. It lets you carry on even in a fresh chat.

      ### Check in

      For each client marked Check in, write a short check-in:
      - personal: mention the last job and why now is a good time, and use my note if I wrote one;
      - offer to book them in, and end with one easy question they can answer in a line;
      - no hard sell, and no discount unless I give you one;
      - a subject line, and a body of 90 words or fewer, not counting the sign-off;
      - signed with my business name and my contact details from my sent mail, with a last line that lets them opt out, such as "If you'd rather not hear from me, just reply and say so."

      Show me all of them first, and wait for my yes. If I ask for changes, rewrite and show me again.

      **With email connected:** once I say yes, create a draft for each one. Never send. Where you can find the last email thread with that client, create the draft as a reply in that thread. Then tell me where you saved the drafts.

      **Without email:** give me each one with the To address, the subject and the body, each in its own block so I can copy them.

      Then build the page again with these changes:
      - Increase `round` by 1.
      - Set each client you wrote for to "drafted".
      - Show those clients in a "Drafted" section at the top, each with a **Done** button I click once I've sent it, which sets its status to "sent". Without email, show each message in that section with a copy button. Keep the notice from Step 3 at the top of the page.
      - Any client still "undecided" keeps its full card, with **Check in** and **Skip**.
      - Skipped clients go into a collapsed "Skipped" section. They stay in the state.
      - The header counts include drafted and sent.
      - The hand-off text uses the new round number.

      ### Skip

      Do nothing with these.

      ## Finally

      When nothing is left undecided, or I say I'm done, give me a summary of two lines:
      - how many check-ins you wrote, and where they are;
      - anyone worth a second look: low confidence, or flagged.
steps:
  - "Connect Gmail or Outlook to your AI assistant first. It works best that way. Without it, you can paste a customer list instead and copy the messages yourself."
  - "Paste the prompt into a new chat. It searches your email, read-only, for clients you've done work for."
  - "On the page it builds, mark each one Check in or Skip, and add a note if there's something to mention. Then click Send my choices to the assistant and paste the result back."
  - "Read the check-ins it writes. Say yes, and it saves them as drafts in your email. Nothing gets sent."
  - "Send them yourself, five a day, and add a line only you could write. When someone answers, reply the same day."
check: Read every draft before it goes. It only knows what's in your email, and it can get a job or a date wrong.
builtVersion: The one I build at CCM Labs knows who's due for a check-in and drafts the message for you.
keyword: FOLLOWUP
sourcePost: https://www.instagram.com/ccmlabs/p/DeSmY57DzeX/
date: 2026-10-09T22:38:00Z
draft: false
---

**One note for Canada:** anti-spam rules (CASL) generally cover people who bought from you in the last two years or asked for a quote in the last six months, and every message needs your business name, your contact details and a way to opt out. That's why the prompt flags anyone whose last job was more than two years ago, and adds an opt-out line to every check-in. Check the rules for your own case.
