# LINKS-TODO — fill before launch

Every `TODO` in `lib/case-links.ts` needs a real, PUBLIC url. Paste the link
from your LinkedIn post or live deployment for each. Null entries are
intentional (no demo exists) — leave those.

How to fill: edit `lib/case-links.ts`, replace the `"TODO"` string with the
URL. TODO links show a dev-only ⚠ badge and are hidden in production, so
nothing broken ever ships — but the proof buttons won't appear until filled.

| Project | Link type | What to paste |
|---|---|---|
| jarvis | demo | Public demo URL (if any safe one exists) |
| jarvis | linkedin | Your LinkedIn post showcasing JARVIS |
| ibrahim | demo | Public demo URL |
| ibrahim | linkedin | LinkedIn post showcasing IBRAHIM |
| adam | demo | **The live Vercel deployment URL of Adam** |
| adam | linkedin | LinkedIn post showcasing Adam |
| atlas | demo | Public demo URL |
| atlas | linkedin | LinkedIn post showcasing Atlas |
| googleads | linkedin | LinkedIn post about the Google Ads agent (+18% ROAS) |
| linkedinsys | linkedin | LinkedIn post about the LinkedIn automation system |
| mediaforge | demo | Public demo URL |
| mediaforge | linkedin | LinkedIn post showcasing MediaForge |
| seosquad | linkedin | LinkedIn post about the Claude SEO Squad |

Profile links (already filled): LinkedIn `in/withhammad`, YouTube `@with.hammad`.

Every case-link click fires a GA4 `case_link_click` event (project + type),
so you can see which proof recruiters actually open.
