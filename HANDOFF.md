# KP Town handoff — September 24, 2026

The user requested a commit and handoff before going to sleep. Stop work after this milestone; no overnight simulation or automation is requested. The current code is built and has **42 passing focused tests**. Final browser and real-model balance validation remain unfinished; do not claim this milestone is fully balanced.

## Workspace and running game

- Repository: `C:/Users/15sag/Documents/Codex/2026-09-23/jevton-laya-local/outputs/jevton-laya`.
- Origin: `https://github.com/nsaghaei/kptown.git`, branch `main`. Authorized to commit and push. Earlier milestone `a4a4bf7` was pushed before the changes in this handoff.
- Originating Codex task: `01a0d1d0-3105-7e30-9d60-6e0f1288ed31` (**Build and validate KP Town**). Send meaningful completion/blocker reports there with `send_message_to_thread`.
- Local Laya server is running on `http://127.0.0.1:8765`, exec session `42966`. Leave it available. Model is entirely local on RTX 5080; no cloud fallback.
- Prepared Python: `../../work/runtime/Scripts/python.exe` from repository root. Model: `../../work/models/laya`. Node is available. System `python` is not.
- Chrome user game is tab `816550398`. **Do not reload or alter it**: it has user progress and may be an older client. A refresh creates a new game. Use a separate test tab. Latest disposable test tab was `816550445`; it may be cleaned up after this turn.
- Simulation sessions `63316` completed, `72803` and `86030` were interrupted after newer user changes. Session `52155` completed ordinary and then failed in the older adverse run; no test simulation is intentionally left running.
- Always read/write Python text as UTF-8. Never patch generated `web/app.js` directly: change `build.py` / `tick.js.txt`, then rebuild.

## Latest user requests implemented

- **KP Town**, human identity always **You**; initial portfolio area only has **Play as an investor**.
- Original Jevton models/materials/road treatment retained; no SF redesign. Compact mixed business blocks, separated parody-fund offices, central plaza, east residential pond, cemetery along outer edge, roads continue through the terrain perimeter. Clean white map labels have no black pills/outline.
- You office moved from the suburbs into the commercial block at approximately `(27.4, 4.7)`.
- **324 residents**, doubled from the 162-resident nightlife version. Unique names and IDs, varied budgets/needs/ages/income/appetite/thrift/novelty/sociability, paid jobs, and sufficient apartment capacity. All 41 businesses remain staffed at initialization.
- Five new ordinary investable venues: **Lantern Bar**, **Juniper Bar**, **Palace Cinema**, **Starlight Cinema**, **Moonlight Diner**. These, existing **Diner**, **Tavern**, and **Jazz club** are open through 1:59am and close at 2am. Optional local-model late attendance uses a small rested night-owl cohort. Staying on an existing paid admission does not repurchase every hour. All venues have real sales, receipts, quality, owners, equity and funding.
- Fair value now uses net revenue plus a larger positive-profit multiple. A separate bounded 24h earnings outlook reflects profitable momentum and funded plans; AI bid limits consider it. Unproven/loss-making firms have no growth premium. Immediate liquidation remains at the current mark, not the outlook; no dividends or buy/sell money printer.
- AI firms review holdings **every simulated hour**, choosing hold, sell half, or full exit. Once per hour prevents repeated sales from same-hour pitch processing. One-share remainders can exit.
- **Pass all** snapshots only currently unanswered pitches. It declines human participation and resolves rival auctions serially; later pitches stay unanswered. Individual Pass/Take and batch Pass never consume an hour. Auto advances only after all pitches and active human turns are resolved, and only if still selected. Closing a card is never a decision.
- 3–6am quiet hours are skipped without model inference, transactions, auctions or disaster rolls. Residents get passive rest; explicitly marked zero-transaction sleep rows preserve financial windows. Pending player choices block skipping. 2am is preserved.
- One floating bottom card, mapside gutters, compact tables, **Close only**, inverse slide-out animation. Human strip says exactly **Your turn**, no explanatory paragraph. No standalone Investor Plaza button.
- Portfolio and inner pitch/holdings scroll positions are preserved during navigation/rerender. Detail scroll is remembered by selected business/investor. Portfolio height is constrained above the bottom card to avoid hidden controls; Pass all is above the pitch list.
- Larger 64-piece win confetti originates from the actual top-left holding row after it renders; only portfolio scrollers may move to reveal the row. Settled human wins only, once per lot, reduced-motion respected. Join bell and win cha-ching remain. Sale sounds use the shares actually sold: profit/register, loss/descending, rounded break-even/neutral; mute respected.
- Every firm in the original right panel, including You, has compact gray **Real / Unrl** signed gains using authoritative basis/realized accounting. Unknown legacy realized totals display a dash.
- Music is neither loaded nor looped. Speaker controls ambience/effects. Resident travel and gait are half speed, with queued journeys; car speed unchanged.
- **Bottom-left camera remote removed from the DOM**. Mouse/keyboard navigation remains. Fresh browser check confirmed `.pad` count 0 and 324/324 residents.
- Corrected decorative investment offices being treated as unstaffed trading businesses by worker reassignment, newcomer jobs, and closure headlines.
- A real adverse run exposed original neighbor-help logic pushing an already-processed resident's hunger below zero. Health/hunger/mood are now clamped at the help mutation; regression test passes. This fix still needs a long real-model rerun.

## Validation completed

Run from repository root: `node --test tests/*.test.mjs`. Latest result: **42/42 pass**. Includes conservation, fixed-lot auctions, dilution and proportional basis, refunds, duplicate settlement protection, zero-hour individual and batch pitch decisions, explicit unaffordable turns, manual Auto pause, active auction isolation, same-hour batch races, hourly AI trim/hold/exit, optional late attendance/2am closure, sleep gating, housing/population variety, bounded profitable growth and real mandate-limited competitive bidding, audio mute/classification, travel pacing, and once-only win callback.

Browser checks on an earlier 162-person client of this milestone:

- Seven pitches appeared at 01:00 with Auto selected and held there.
- Individual Diner Pass left six pitches and the hour unchanged. Chosen Bazaar auction reached an explicit human bid. Pass all was disabled during the live human turn.
- Close produced the leaving class; reopen restored the same pending turn at the same hour. Compact Your turn strip and Close-only layout were visible.
- Actual Bazaar $325 win settled, giving $1,875 cash and ~$234 mark. The win callback recorded `data-player-win-count=1` and `data-last-win-anchor=market11`. A screenshot did not reliably catch the transient confetti, so **visual burst verification remains**.
- Actual half-sale paid $117 and displayed Real −$45 / Unrl −$45 with remaining basis ~$163. Muted controls were used; auditory output was not listened to.
- Firm list typography visually matched neighboring business/traffic rows.
- Pass-all clicks while the card was open appeared to have no effect because the button was covered by the bottom card; portfolio sizing and button placement were then fixed. **The complete browser Pass all / resume flow needs retesting after that fix.** Unit tests already pass.
- Before these later refinements, a separate spectator run reached 12 hours without auction card/camera hijacking.

## Remaining work, in order

**Final user additions before sleep — NOT implemented/completed in this commit:**

- Businesses must never sell more than 100% of their equity, and sellable equity should only become available again when investors sell their shares. The current model uses primary issuance/dilution with founders retaining at least 51%, and liquidated shares stay with the settlement account. Although percentages currently conserve ownership, **it does not implement the user's requested fixed, recyclable equity availability**. Address this first. Use a clearly defined fixed total equity pool and authoritative available/held balances; resolve how founder holdings and proceeds from reselling returned shares fit that model. Do not retain repeated dilution merely because older tests assert it. Update quote, mark, offer reserve, settlement, liquidation, ownership UI, cost basis and tests together. Every transaction must keep total shares/ownership at or below the fixed 100% supply, with a sell transaction returning exactly the sold quantity to availability. Cover simultaneous offers, sold-out companies, partial exits, repeated buys/sells, and failed/duplicate settlement. Display available equity so the rule is legible.
- The user explicitly wants **many more actual playtests** and a broad set of evidence-backed proposals for more fun and clearer dynamics, balancing, mechanics and additions. The earlier eight matched cases are insufficient. After the equity change, run a substantial campaign across ordinary/adverse conditions, multiple fixed seeds, several days, passive/random/trend/informed policies and different user participation patterns. A useful first matrix is 5 seeds × 2 scenarios × 4 policies, with shared warmups and exact-request caching, then targeted regressions for failures. Use real local Laya for behavior; unit fixtures remain separate. Publish distributions, not a cherry-picked winning game. Include purchase/customer volume, population causes of death/departure, bidding depth, share exhaustion/recycling, funding purpose, owner delivery, actual realized profit/loss, liquidity, returns and model latency. Keep the same decision opportunities when comparing policies. Produce a prioritized set of proposed dynamics and readability improvements, then distinguish suggestions from any changes actually authorized/applied.

These late additions were recorded for resumption because the user's earlier instruction was to commit/handoff and stop for sleep. No large overnight campaign or automation was started.

1. **Fresh separate browser smoke test of final source.** Check Pass all visible and actionable with card open, exact zero clock movement on Pass/Pass all, Auto only resuming separately when clear, manual pause, close/reopen, choosing an out-of-order pitch, and no duplicate settlement. Verify the new scroll preservation with a scrolled pitch list and returning from a business to holdings. No user-tab reload.
2. Verify 324-resident scene performance, per-venue hours, optional late attendees through 1am and departure at 2am, 3→6am skip, and new You location. Confirm original Gazette Story/Headlines and resident navigation, actual map clicks opening bottom business card, daylight cars and slower residents, no geometry/road clipping. Default white labels can overlap densely when zoomed in; assess without reintroducing black backgrounds.
3. Capture actual portfolio-origin win confetti; verify once on repeated investment/updated row, scrolled portfolio, cleanup and reduced motion. Test sale success once and mute; unit tests cover profit/loss/even partial/full classifications. No need to repeat every passing unit check unless code changes.
4. **Run final real-model simulations.** Latest 324/outlook/hourly-sales/sleep build has not completed a full run. Start e.g. `node tests/balance-local.mjs 48 ordinary 1970`, then adverse. The updated runner skips quiet hours and includes nightlife diagnostics. Fix material invariant failures, especially recheck neighbor help.
5. Run `node tests/policy-comparison.mjs 24 1967` for 24h common warmup + 24h participation, four matched policies in ordinary/adverse conditions; or use `48` for 72h endpoints. The runner uses actual local Laya responses with exact-request caching, never synthetic model decisions. The two earlier attempts were interrupted after new requirements, so their short warmups are not final evidence. **Audit its human policy sale cadence (currently 12h) versus newly hourly AI choices**, and report this clearly or compare policies with matched opportunities.
6. Measure whether doubled citizens actually increase purchases and business evidence, whether profitable businesses appreciate enough to support multi-firm bidding, and whether AI capital recycles without always liquidating immediately. Do not inflate values or rig seeds to manufacture wins. Inspect full case states and fail/return/conversion metrics; compare equal horizons and versions.
7. Deliver a concise simulation/balance report and proposed next improvements. `BALANCE-NOTES.md` and `validation-summary.json` preserve honest historical evidence. Final results must explicitly separate earlier 152/162-person runs from the 324-person version. More than one seed is needed before claiming strategy advantage or long-term balance.
8. Commit/push verified follow-ups to the authorized repository, then report to the originating task. Hosting for colleagues remains a later task: local loopback server only, no public deployment/authentication established.

## Commands and artifacts

Build from the parent workspace: `& './work/runtime/Scripts/python.exe' './outputs/jevton-laya/build.py'`.

Push requires the bundled helper in this Windows session:

```powershell
$env:GIT_EXEC_PATH='C:/Users/15sag/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/mingw64/bin'
git -c safe.directory=C:/Users/15sag/Documents/Codex/2026-09-23/jevton-laya-local/outputs/jevton-laya -c credential.helper=manager push -u origin main
```

Use the normal network escalation when needed; the user has already authorized pushes. Never force-push. Runtime, models, audit logs, large states and `validation-runs/` are intentionally ignored. User-facing source/docs and compact summary are committed; intermediates are under parent `work/`.

Local historical data: `validation-runs/policy-comparison-before-nightlife.json`, `policy-comparison-pre-final-housing.json`, `ordinary-1965.json`/state (48h completed), `adverse-1966.json`/state (44h saved before old hunger failure at 45). Older policy state files may still refer to the previous completed 72h comparison until a new case overwrites them; always check seed/hour/initial population.
