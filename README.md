# Care Ops AI Roadmap

A web slide deck presenting an AI solution architecture for a healthcare services organization. It covers follow-up orchestration, a pilot that uses no PHI, and a governed path to AI on member-level data.

**Live:** https://gabrielbextconsultancy-hash.github.io/healthcare-ai-architecture-proposal/

## Presenting

| Key | Action |
| --- | --- |
| `→` `Space` `PageDown` | Next slide |
| `←` `PageUp` | Previous slide |
| `O` / `Esc` | Overview of all slides |
| `N` | Speaker notes |
| `P` | Print view (all slides stacked, use the browser's Save as PDF) |

Swipe left/right on touch screens. Each slide has a deep link: `#4` opens slide 4.

## Structure

- 10 core slides covering assessment questions Q1–Q10, plus appendix A1–A5 for Q&A
- `slides/index.tsx` holds the core slides and `slides/appendix.tsx` holds the appendix
- `components/diagrams/` holds the inline SVG diagrams (architecture, lifecycle, PHI boundary, RAG, referral)
- `components/Deck.tsx` is the slide engine

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

Built with Next.js (static export) and Bootstrap 5. Deployed by GitHub Actions on every push to `main`.
