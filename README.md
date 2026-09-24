# Jevton with local Laya and an investor

Open **http://127.0.0.1:8765** while the local server is running. To start it again, run `Start-Jevton.cmd` in this folder. Keep its terminal open; Ctrl+C stops it. Refreshing the game starts a new town, as in the original.

Use **Next hour** or **Auto** to run the town. **Investors** opens Rowan Vale's inspector. Select a business in the town overview to inspect funding requests, ownership, model probabilities, and exact cash transfers. The investor is autonomous; there is no player investment approval step.

## Preserved reference

This is a local adaptation of the browser-delivered client from **Chizi's [Jevton](https://jevton.chizi.app/)**. It retains the original 3D town, seeded 120 residents, 38 homes, 17 businesses, three public spaces, seven roads, professions, relationships, activities, economy, council, Gazette, seasons, disasters, migration, mortality, inheritance, audio, and controls. The public client snapshot is retained in `vendor/`; `provenance.json` records its hash. Inspection notes are in `REFERENCE.md`.

No public source repository or backend is required. This folder has not been published. Original code, visuals, and audio remain attributed to their owners; the original client is not claimed to be open source. Three.js and Laya license notices are retained in `vendor/`.

## Local decisions

The Python server binds **127.0.0.1 only** and loads the official **convaiinnovations/laya** general English checkpoint from this workspace. Inference uses the RTX 5080; no Jev key or hosted inference is used. Fonts and all 32 audio assets are local. The server sets Hugging Face/Transformers offline mode and the page's content security policy restricts connections to itself.

Every living resident still gets seven typed decisions. Laya also decides road traffic, council priorities, tax, business prices, headlines, funding requests, and investment acceptance. Context is separated by entity to fit Laya's smaller context window. The council is asked once per hour instead of once per resident batch. Long lists of candidate headlines are ranked in groups. No scripted policy substitutes for a model answer. Failed or malformed decisions roll back the hour.

Resident prompts use current needs and availability. Previous action and current location remain in the simulation and inspector but are omitted from model input: testing showed they caused Laya to repeat actions even when residents were starving. Numerical needs are also expressed in short factual phrases such as “hungry” or “exhausted.”

**Laya is a different model. Its choices and confidence differ from Jev's.** The original rules and layout are preserved, but matching the original town's trajectories is not claimed. The original economy itself has production inflows and consumption outflows; the conservation checks apply to the new investment and dividend transfers.

## Financing rules added here

- Rowan Vale starts as an additional investor entity at the Bank with $4,000, a $500 reserve, and an $800 maximum ticket. No resident is replaced.
- A staffed business below three normal payrolls, with a minimum buffer of $120, may consider funding every six hours. Laya chooses whether to raise or hold.
- The requested capital aims to cover six normal payrolls, bounded to $200–$800. Pre-money value is at least $1,200, otherwise 24 normal payrolls plus cash. Shares are issued using integer accounting; existing owners retain at least 51%.
- Rowan sees the actual offer, cash, staffing, sales and payroll shortfalls, then chooses invest, decline, or defer. Every acceptance is validated against available cash and ownership limits.
- Investors receive their ownership share of 20% of positive daily operating profit, only to the extent cash above the operating buffer permits. New financing is excluded from profit. No returns are guaranteed.

These are explicit new rules for the requested extension, not hidden rules attributed to Jevton.

## Files and verification

- `web/app.js`: original simulation and renderer with small, reproducible local integration changes.
- `web/investors.js`: offers, autonomous investor decisions, ownership, transfers and dividends.
- `web/decisions.js`: entity-specific Laya questions and context.
- `web/local-ui.js`: investor and business inspectors.
- `server.py`: local inference and static serving.
- `build.py` / `tick.js.txt`: reproducible adaptation of the original client.
- `tests/finance.test.mjs`: conservation, duplicate settlement, reserves, ownership, dividends, refusal and invalid-answer checks.
- `tests/verify-local.mjs`: a real-model 12-hour integration run; `verification.json` contains measured results.

Run checks from this folder with `node --test tests/finance.test.mjs`. With the server running, `node tests/verify-local.mjs` runs the integration check. Runtime dependencies, checkpoints, and detailed inference audits are in the workspace's `work/` directory, outside the deliverable source folder. No credentials are needed.

The bundled environment currently uses Python 3.12, PyTorch 2.11.0+cu128 and Laya 0.3.11. `requirements.txt` records the main package versions. The launcher expects the prepared workspace layout; if this folder is moved, create a Python environment, install PyTorch and requirements, download the official Laya checkpoint, and run `python server.py --model C:\path\to\local\laya --device cuda` (or `--device cpu`).
