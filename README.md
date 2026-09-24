# KP Town · local Laya

A local investing game adapted from Chizi's [Jevton](https://jevton.chizi.app/). The original town, residents, graphics, sound and controls are retained, with an extended consumer/business economy and Investor Plaza. The current town has 324 residents and 41 investable businesses. Development and balance validation are ongoing; accounting checks are in `tests/`.

## Run

In the prepared workspace, run `Start-KP-Town.cmd`, then open **http://127.0.0.1:8765**. Keep the terminal open. Ctrl+C stops the server. A browser refresh starts a new town.

For a fresh checkout, install Python 3.12, create `.venv`, install a suitable PyTorch build plus `requirements.txt`, then run `.venv/Scripts/python.exe setup_model.py`. Start with `.venv/Scripts/python.exe server.py --model models/laya --device cuda`. CPU is supported with `--device cpu` but is slower. Checkpoints are downloaded only during setup; gameplay inference runs offline. The prepared runtime uses PyTorch 2.11.0+cu128 and Laya 0.3.11 on an RTX 5080.

## Play

Advance with **Next hour** or **Auto**, or watch the autonomous town. Before joining, the portfolio area contains only **Play as an investor**. Joining creates **You** with $2,200. In spectator mode, NPC auctions run quietly in the background while your chosen inspection stays open.

Your portfolio lists every currently pitching business. Choose **Take pitch** for a particular business to start its auction, or **Pass** to let rivals compete without you. **Pass all** declines the unanswered pitches currently listed. Passing one or all pitches consumes no simulation hour. Taking a pitch commits no cash. Auto waits until all outstanding pitch choices and each of your auction turns have explicit decisions. Close slides the card out of view without passing. A pending bidding turn can be reopened from the portfolio. Manually turning Auto off keeps it off. Quiet hours from 3am to 6am are skipped without model calls, transactions or disaster rolls; explicit player decisions still block the jump. Skipped periods are labeled in financial history.

Businesses offer fixed equity lots. Investors take turns raising by the stated increment or passing permanently. The highest bidder wins when all others pass. No bidder means no transfer. Business map labels and the original right-panel business list open the same floating card. Holdings can be inspected and sold from the portfolio.

The speaker button mutes/unmutes effects and environmental ambience. Background music is never loaded or played. Joining gives a quiet bell; a successfully settled player win gives a short cash-register effect and a larger upward confetti spray from the new or updated top-left holding row (motion omitted with reduced-motion preferences). Successful sales play profit, loss or neutral feedback using the proportional realized basis. Right-panel firms show signed realized and unrealized gains. Resident travel takes twice the original duration; simulation and traffic speed are unchanged.

Investor cash is finite. AI investors have different cash reserves, ticket/concentration limits and valuation mandates; local Laya chooses within those limits. Every simulated hour, each rival can hold, sell half or fully exit each stake to recycle cash. Same-hour pitch actions do not repeat that review. Names are playful fictional labels, not claims about real firms.

Shares can be liquidated immediately at their **current marked value**, rounded down to whole dollars. There are **no dividends or profit distributions**. A visible simulation settlement account pays liquidations and retains the shares. It is an elastic game settlement account, not a business customer: its balance may become negative and its outflows never count as company revenue. New issues open at or above the marked post-issue stake; unspent financing is excluded from operating value to prevent cash being counted twice.

## Economy and evidence

Residents have individual cash, hunger, energy, health, persistent tastes and purchase cadences. Laya selects activities, effort, food spend and destinations. Owner strategy and discretionary category/store/purchase choices use seeded sampling from the actual local model probabilities; essential resident actions and the other decisions use the model choice. Sampling is recorded alongside the top model choice and does not substitute scripted answers. Changing trends affect only part of the population; constrained budgets and health can change individual demand. The 41 operating businesses include the original 17 and 24 additions: clothing, books, leisure, food, production and neighborhood services. Original building models, road treatment and materials are reused in a compact 48-unit square; the plaza, residential pond and cemetery provide intentional open space. Clinic, school, grocery and cafe businesses are interspersed among homes. Schools retain the simplified original service-contract model; no child/daycare transactions are invented. Lantern Bar, Juniper Bar, Palace Cinema, Starlight Cinema and Moonlight Diner are staffed investable firms. They, the original diner, Tavern and Jazz club stay open until 2am; a small cohort of rested night owls can choose late visits, and an ongoing admission is not charged again. Purchases, browsing, returning customers and product returns are separate events. Residents have varied starting budgets, needs, income multipliers, thrift, novelty and sociability; apartment capacity supports the doubled population.

Receipt-backed quality failures cause return visits and refunds after two game hours. Refunds cannot exceed the original customer payment. Unpaid refund obligations remain explicit and reduce business value. Pitches and business inspectors expose trailing 24-hour customer, revenue, cost, quality and return evidence; growth compares two complete 24-hour windows. New purchases are shown as pending, not as a proven perfect return record.

Owners have persistent adaptability and execution traits. Laya chooses strategy and products. Funded changes spend real cash, take time, and change product mix, capacity, appeal, quality or costs. Weak businesses can contract or fail; displaced workers may transfer to a compatible operating firm. Failed equity is worth zero.

Valuation uses observed net revenue, operating profit, growth and available operating cash. Profitable earnings receive a larger multiple; a separately displayed, bounded 24-hour outlook uses profitable momentum and funded plans. AI bid mandates consider that uncertain outlook. Startup and loss-making firms receive no invented growth premium. Startup estimates fade as a day of evidence arrives. Estimates are a deterministic game rule, distinct from auction prices. No guaranteed strategy or realistic appraisal is claimed.

The original rules were deliberately tuned for a longer investing loop: sleeping metabolism is slower, ordinary mood loss is smaller, and emigration is checked every six hours. Production is credited only while the workplace can operate. Original disasters remain available.

## Source, tests and provenance

- `web/investors.js`: auctions, equity, mandates, value, liquidation and transfer ledger.
- `web/economy.js`, `web/metrics.js`: demand, business plans, receipts and refunds.
- `web/decisions.js`, `server.py`: actual local Laya inference. No cloud fallback.
- `web/local-ui.js`: plaza, scorecards and persistent portfolio.
- `build.py`, `tick.js.txt`: reproducible patches to the preserved original client.
- `tests/finance.test.mjs`, `tests/extended.test.mjs`: accounting, refunds, chosen pitches, layout, audio and travel checks.
- `tests/policy-comparison.mjs`: matched ordinary/adverse full simulations comparing cash, random legal, revenue-trend and conservative informed policies; exact identical model requests can reuse prior real-model results.
- `tests/balance-local.mjs`: real-model extended simulations; large run data stays untracked.

Run `node --test tests/*.test.mjs` (42 checks currently pass). With the local server running, `node tests/balance-local.mjs 72 ordinary 1956` runs a three-day simulation. Audit logs, virtual environments, weights and large test states are excluded from Git.

This adaptation retains original attribution. The browser-delivered Jevton client is saved in `vendor/`, and `REFERENCE.md` records direct inspection. Its code/assets are not claimed to be original work or open source. Third-party license notices are retained. `provenance.json` records source/build hashes.

The latest state and remaining browser/simulation checks are in `HANDOFF.md`. Historical balance findings and proposed improvements are in `BALANCE-NOTES.md`; they are not proof of final-build balance.

## Sharing with colleagues

The current server binds only to loopback and is not an Internet service. A static host alone cannot supply local GPU Laya inference. A practical colleague deployment needs a private authenticated web service with the same model on a GPU host, per-session state, request limits and HTTPS, or each colleague running this repository locally. Hosting destination and access controls must be selected before deployment. No deployment is included in this local build.
