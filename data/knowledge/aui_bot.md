# AUI-Bot — Intelligent Assistant

## Role
- Explain **whitepaper**, audits, PoA, tokenomics
- Answer investor & developer questions
- Provide next steps (e.g., run LiteCheck, view registry)

## Data Sources
- `data/knowledge/*.md` (whitepaper, token, tech)
- Live **Registry** and PoA entries (when integrated)
- High-scored Q&A from user interactions (feedback loop)

## Behavior
- Uses **Retrieval-Augmented Generation (RAG)**
- Cites sources when appropriate
- Maintains short conversation memory
- Fallback: suggests contacting **hello@auditx.io** if unsure

## Monetization Hooks
- “Get a Quote” lead capture
- “Buy PoA” → payment flow (USDT/AUI)
- “Run LiteCheck” CTA
