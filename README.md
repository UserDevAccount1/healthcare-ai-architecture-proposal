# Care Ops AI Roadmap

A web slide deck presenting an AI solution architecture for a healthcare services organization. It covers follow-up orchestration, a pilot that uses no PHI, and a governed path to AI on member-level data.

**Live:** https://userdevaccount1.github.io/healthcare-ai-architecture-proposal/

## Presenting

| Key | Action |
| --- | --- |
| `→` `Space` `PageDown` | Next slide |
| `←` `PageUp` | Previous slide |
| `O` / `Esc` | Overview of all slides |
| `P` | Print view (all slides stacked, use the browser's Save as PDF) |

Swipe left/right on touch screens. Each slide has a deep link: `#4` opens slide 4.

## Structure

- Main slides plus a supporting appendix
- `slides/` holds the slide content; `slides/appendix.tsx` holds the appendix
- `components/diagrams/` holds the inline SVG diagrams (architecture, lifecycle, PHI boundary, RAG, referral)
- `components/Deck.tsx` is the slide engine

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

Built with Next.js (static export) and Bootstrap 5.

## Deploying

```bash
npm run deploy   # builds and pushes ./out to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch. The workflow in `.github/workflows/deploy.yml` can take over once GitHub Actions is available on the account: switch the Pages source to "GitHub Actions".

