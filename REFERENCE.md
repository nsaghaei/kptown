# Jevton reference inspection

Inspected 23 September 2026 (Pacific time), before implementation.

## Provenance

- Creator: Chizi / Chiziaruhoma Ogbonda (@chiziaruhoma).
- Original post: https://x.com/chiziaruhoma/status/2100878555047514390
- The creator's reply links to https://jevton.chizi.app/ . This is the inspected game. Other projects named “Jevtown” are unrelated.
- Publicly served assets: `index-5e95p6fp.js` and `index-gv4n9k1y.css`.
- No public Jevton repository was found in the creator's public repository listing. Public availability is not an open-source license. The original town code, design, and audio remain attributed to their owners; this adaptation is for the requested local use and has not been published.

## Direct browser observations

The game starts on Day 1 at 00:00 with 120 residents, all resting. Initial aggregates: mood 70, health 86, fed 80, resident cash $6,023, treasury $600, income tax 10%. The two views are 3D and Map. The canvas supports pan, orbit, zoom, keyboard movement, and selecting/following residents. Controls include Next hour, Auto, sound, conditions, and disaster frequency. Resident panels have previous/next navigation, household and coworker links, and Timeline/Story tabs. The Gazette has Headlines/Story tabs.

I navigated through all 120 distinct resident panels at 01:00 using the next-resident control. Visible resident fields are name, profession, age, activity, location, energy, fed, health, mood, money, decision confidence, home, workplace, work effort, meal budget, outlook, illness risk, person being checked on, household, coworkers, and life history. Professions initially total: 14 clerks, 19 builders, 14 farmers, 19 doctors, 19 traders, 24 musicians, 11 teachers.

The town overview exposes every business's till and price percentage, all seven roads' traffic, the council's emergency probability and priority, population and wellbeing aggregates, workforce, economy, and newspaper. Clicking the Bazaar building on the Map did not open a separate business inspector.

The 17 businesses shown are Town Office, Bank, Library, Brickworks, Workshop, Warehouse, Mill, Farm, Orchard, School, Market, Diner, Bazaar, Clinic, Hospital, Tavern, and Jazz Club. The other three non-residential places are Park, Plaza, and Riverside. The seven roads are North Road, Market Street, Mill Road, South Road, West Avenue, Central Avenue, and East Avenue.

### Observed transitions

| Hour | Conditions | Population | Resident cash | Notable observations |
| --- | --- | --- | --- | --- |
| 00:00 | Ordinary | 120 | $6,023 | All resting; 0 model decisions |
| 01:00 | Ordinary | 120 | $6,017 | 879 decisions, 14 calls; 119 rest, 1 tavern; Tavern till $156 |
| 02:00 | Ordinary | 120 | $6,006 | 118 rest, 2 tavern; Jazz Club price falls to 85% |
| 03:00 | Ordinary | 120 | $6,006 | Fed 50, health 95 |
| 04:00 | Ordinary | 120 | $6,006 | Fed 40, health 97 |
| 05:00 | Ordinary | 120 | $6,006 | Fed 30, health 98 |
| 06:00 | Ordinary | 120 | $5,976 | Fed 20, 2 in distress |
| 07:00 | Ordinary | 120 | $6,381 | Fed 14, 11 in distress; work income appears |
| 08:00 | Ordinary | 120 | $6,073 | 115 eat, 4 work, 1 park; 1 unpaid; treasury $263; council prioritizes food |
| 09:00 | Gold rush | 128 | $6,682 | 8 newcomers; 46 work, 55 eat, 12 clinic, 7 help; 9 unpaid; tax 7%; treasury $48 |
| 10:00 | Flu outbreak | 127 living / 128 total | $6,410 | 1 death; 22 clinic; council prioritizes health; tax 4%; treasury $3 |

Random disasters were set to “No disasters” after the first hour to isolate ordinary transitions. Gold rush and Flu outbreak were selected manually through the original controls.

At 08:00 the Clinic had $75, Hospital $123, and Market $350. Cumulative figures were $524 earned, $423 spent, 115 meals, 4 clinic visits, and 1 neighbour visit. At 09:00 the Clinic had $54. These cash shortages motivate the added financing mechanism.

Juno Haddad, a 38-year-old trader at Bazaar, initially had energy 82, fed 67, health 70, mood 71, and $78. After one hour resting: energy 100, fed 57, health 74, mood 70, $78, confidence 79%, illness risk 7%, content outlook. Juno lives in House 10 with Zia and Mae.

I inspected Pax Okafor after death: builder, age 62, House 3, Workshop, health 0, money $0. The Story tab reports death from flu at 09:00 and $44 passed to three housemates. The Gazette also reported this death.

## Verified from public client code, distinct from UI observation

The supplied client contains the town layout, seeded initialization, seven resident questions (activity, distress, effort, spending, illness risk, outlook, whom to help), road questions, council questions, price/tax decisions, headline selection, deterministic consequences, mortality, inheritance, migration, retraining, seasons, audio, and renderer. The UI's “money in the city” is the sum of living residents' cash, excluding business tills and treasury. Production creates revenue, while several other flows consume funds; the original economy is not a closed money supply.

Preservation is based on this particular deployed client snapshot. The private server's model configuration and Jev's hidden behavior were not inspected. Local Laya probabilities will differ. A single town council judgment per hour replaces the original's duplicate council judgments in resident batches; the seven questions per resident remain.

## Investor extension scope

Investors are additional autonomous entities. Existing residents and businesses remain. A cash-constrained business can choose whether to seek equity financing; investors choose whether to fund a concrete offer using local Laya. Code determines offer limits, ownership accounting, valid transfers, and distributions. These investor rules are a new extension, not claimed to exist in the reference.
