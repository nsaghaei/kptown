# KP Town · local Laya

A local investing game adapted from Chizi's [Jevton](https://jevton.chizi.app/). The original town, residents, graphics, sound and controls are retained, with an explicitly extended consumer/business economy and Investor Plaza. Development and balance validation are ongoing; accounting checks are in `tests/`.

## Run

In the prepared workspace, run `Start-Jevton.cmd`, then open **http://127.0.0.1:8765**. Keep the terminal open. Ctrl+C stops the server. A browser refresh starts a new town.

For a fresh checkout, install Python 3.12, create `.venv`, install a suitable PyTorch build plus `requirements.txt`, then run `.venv/Scripts/python.exe setup_model.py`. Start with `.venv/Scripts/python.exe server.py --model models/laya --device cuda`. CPU is supported with `--device cpu` but is slower. Checkpoints are downloaded only during setup; gameplay inference runs offline. The prepared runtime uses PyTorch 2.11.0+cu128 and Laya 0.3.11 on an RTX 5080.

## Play

Advance with **Next hour** or **Auto**, or watch the autonomous town. **Play as KP** joins the investors with $2,200. The clock pauses for your bid or pass. Businesses offer a fixed equity lot; investors take turns raising by the stated increment or passing permanently. The highest bidder wins when all others pass. No bidder means no transfer. At most three auctions run per plaza session. Inspect businesses and portfolios at any time.

Investor cash is finite. AI investors have different cash reserves, ticket/concentration limits and valuation mandates; local Laya chooses within those limits. Names are playful fictional labels, not claims about real firms.

Shares can be liquidated immediately at their **current marked value**, rounded down to whole dollars. There are **no dividends or profit distributions**. A visible simulation settlement account pays liquidations and retains the shares. It is an elastic game settlement account, not a business customer: its balance may become negative and its outflows never count as company revenue. New issues open at or above the marked post-issue stake; unspent financing is excluded from operating value to prevent cash being counted twice.

## Economy and evidence

Residents have individual cash, hunger, energy, health, persistent tastes and purchase cadences. Laya selects activities, effort, food spend and destinations. Changing trends affect only part of the population; constrained budgets and health can change individual demand. Original shops are joined by clothing, books and leisure venues. Purchases, browsing, returning customers and product returns are separate events.

Receipt-backed quality failures cause return visits and refunds after two game hours. Refunds cannot exceed the original customer payment. Unpaid refund obligations remain explicit and reduce business value. Pitches and business inspectors expose trailing 24-hour customer, revenue, cost, quality and return evidence; growth compares two complete 24-hour windows. New purchases are shown as pending, not as a proven perfect return record.

Owners have persistent adaptability and execution traits. Laya chooses strategy and products. Funded changes spend real cash, take time, and change product mix, capacity, appeal, quality or costs. Weak businesses can contract or fail; displaced workers may transfer to a compatible operating firm. Failed equity is worth zero.

Valuation uses observed net revenue, operating profit, growth and available operating cash. Startup estimates fade as a day of evidence arrives. Estimates are a deterministic game rule, distinct from auction prices. No guaranteed strategy or realistic appraisal is claimed.

The original rules were deliberately tuned for a longer investing loop: sleeping metabolism is slower, ordinary mood loss is smaller, and emigration is checked every six hours. Production is credited only while the workplace can operate. Original disasters remain available.

## Source, tests and provenance

- `web/investors.js`: auctions, equity, mandates, value, liquidation and transfer ledger.
- `web/economy.js`, `web/metrics.js`: demand, business plans, receipts and refunds.
- `web/decisions.js`, `server.py`: actual local Laya inference. No cloud fallback.
- `web/local-ui.js`: plaza, scorecards and persistent portfolio.
- `build.py`, `tick.js.txt`: reproducible patches to the preserved original client.
- `tests/finance.test.mjs`: accounting and mechanism checks.
- `tests/balance-local.mjs`: real-model extended simulations; large run data stays untracked.

Run `node --test tests/finance.test.mjs`. With the local server running, `node tests/balance-local.mjs 72 ordinary 1956` runs a three-day simulation. Audit logs, virtual environments, weights and large test states are excluded from Git.

This adaptation retains original attribution. The browser-delivered Jevton client is saved in `vendor/`, and `REFERENCE.md` records direct inspection. Its code/assets are not claimed to be original work or open source. Third-party license notices are retained. `provenance.json` records source/build hashes.

## Sharing with colleagues

The current server binds only to loopback and is not an Internet service. A static host alone cannot supply local GPU Laya inference. A practical colleague deployment needs a private authenticated web service with the same model on a GPU host, per-session state, request limits and HTTPS, or each colleague running this repository locally. Hosting destination and access controls must be selected before deployment. No deployment is included in this local build.
