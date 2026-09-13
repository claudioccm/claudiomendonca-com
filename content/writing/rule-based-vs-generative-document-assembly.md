---
title: "Rule-Based vs Generative AI: Decision Framework for Document Assembly"
category: "Essay"
date: "2026-09-13T16:07:52.617Z"
excerpt: "A practical decision matrix helps ops leaders pick rule-based scripts or generative AI for document assembly based on predictability, input structure, and accuracy needs."
dek: "A practical decision matrix helps ops leaders pick rule-based scripts or generative AI for document assembly based on predictability, input structure, and accuracy needs."
readingTime: 5
draft: false
featured: false
varro_published: true
---

Ops leaders rebuild the same reports and documents every cycle because they lack a clear way to match the tool to the task. A simple decision framework based on output predictability, input structure, and required accuracy removes that guesswork. The choice between rule-based scripts and generative AI follows directly from those three factors.

## When Rule-Based Systems Are the Right Choice

Rule-based systems produce identical output every time when the inputs follow a fixed structure and stay stable across cycles. They suit high-volume documents where any deviation creates risk or rework. Legal teams use them for contracts, compliance forms, and transfer pricing packages that draw from the same data fields repeatedly.

LCN Legal built a bilingual transfer pricing application with Gavel's document automation tool. The firm started with its simplest agreement template, wrote questions focused on user objectives, and let the rules handle the rest. The result gave international tax professionals a repeatable process that pulled corporate data into consistent agreements.

Rule-based automation delivers deterministic accuracy. Once the logic is set, the same inputs always generate the same document. [Thomson Reuters reports](https://legal.thomsonreuters.com/en/insights/articles/document-automation-saves-time) that teams using these systems cut the time spent generating contracts and legal documents by up to 82 percent. Another Gavel study recorded over 90 percent time savings on document generation tasks. Costs remain predictable because there are no per-token fees or model drift to manage.

These systems require upfront work to define the rules and templates. That investment pays off only when the document type repeats often enough to justify the initial setup. When inputs change frequently or require narrative judgment, the same rigidity becomes a limitation.

The data must be stable. Otherwise the rules break on the first exception.

According to a [Gavel case study](https://www.gavel.io/resources/case-study-lcn-legal-uses-document-automation-to-build-transfer-pricing-app), the LCN Legal team measured the full cycle from intake to final PDF. They tracked every manual step before automation and compared it to the automated flow. The difference showed up most clearly on repeat use: each new matter required almost no additional configuration once the initial template and questions were locked.

## When Generative AI Becomes Necessary

Generative models process unstructured inputs and produce narrative text that adapts to context and tone. They fit situations where data arrives in varied formats and the output must synthesize information rather than fill fixed fields. Contract review and risk analysis often fall into this category because the source material lacks consistent structure.

Master of Code built an AI-powered Legal Advisor Tool that anonymizes personal data, assesses risk with Gemini, and returns structured reports. Across more than 50 deals, the tool cut manual review time by a factor of two to four while surfacing GDPR gaps and negotiation points that manual review had missed. The system handled documents that arrived in inconsistent formats and required contextual understanding.

Accuracy remains the central constraint. A Stanford HAI study found that even specialized legal AI tools using retrieval-augmented generation hallucinated more than 17 percent of the time on legal queries. General-purpose models performed worse. Any workflow that uses generative AI for high-stakes documents must keep a [human in the review loop](/blog/human-in-the-loop-ux-approval-interfaces).

Cost structures also differ. Generative AI charges by token volume, with output tokens typically costing five to six times more than input tokens. The expense scales with usage and requires ongoing monitoring of prompt length and model choice. Teams that treat it as a drop-in replacement for rules quickly see variable costs rise. [LLM cost optimization techniques](/blog/llm-cost-optimization-prompt-engineering-system-design) can help control these expenses through prompt rewriting and batch APIs.

[Microsoft documented](https://www.microsoft.com/en/customers/story/23921-assembly-software-azure-ai-foundry) similar gains when Assembly Software deployed Azure AI Foundry for routine legal drafting. The measured approach started with stable intake processes before scaling.

One practical limit shows up quickly in testing. When the input documents contain contradictory clauses or jurisdiction-specific language, the model sometimes merges the contradictions into a single fluent paragraph. That output looks polished yet hides the conflict. A rule-based system would have flagged the mismatch or refused to proceed.

## Building a Practical Decision Matrix

Evaluate three factors before selecting a tool: output predictability, required accuracy, and input structure. High predictability and structured inputs point to rule-based scripts. Low predictability, variable inputs, or the need for synthesized narrative point to generative AI. When accuracy must be absolute, rule-based systems carry lower risk.

Cost follows the same split. Rule-based systems carry fixed development and maintenance costs that do not change with volume. Generative AI costs rise with every additional document and require technical oversight for prompt engineering, fine-tuning, or retrieval-augmented generation. Start with the simplest document type in your current workflow and measure the actual hours saved before expanding.

Assembly Software's NeosAI deployment shows the value of this measured approach. The system reduced drafting time from 40 hours to minutes on routine legal documents and saved up to 25 hours per case on data entry and review. The team began with clear intake processes and added automation only after the data quality was reliable.

Track both time saved and error rates for the first 10 to 20 documents. If hallucinations or formatting drift appear, the matrix signals that the task belongs on the rule-based side or needs tighter human oversight. Adjust the choice as the document type or input stability changes.

One more point on structure. [IBM's comparison](https://www.ibm.com/think/topics/rag-vs-fine-tuning-vs-prompt-engineering) of RAG versus fine-tuning shows that retrieval methods reduce but do not eliminate hallucinations on variable legal text.

The matrix itself stays simple on paper. Draw three columns: predictability, accuracy, structure. Score each document type from one to five. Anything averaging above four leans rule-based. Anything below three leans generative. The middle band usually needs a hybrid: rules for the fixed sections, generative AI only for the narrative summary that follows.

## Conclusion

The decision between rule-based scripts and generative AI is not a technology preference. It follows from the concrete properties of the documents you produce and the inputs you receive. Teams that apply the three-factor matrix avoid both brittle rule sets and unnecessary hallucination risk.

Begin with one recurring document type. Run it through the matrix, implement the simpler option first, and record the hours saved. This single step removes the largest source of wasted cycles in most document assembly workflows.

If your team still spends hours each month rebuilding the same reports, map your current documents against the three factors above and test the lighter approach on the next cycle.
