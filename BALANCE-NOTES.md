# Simulation findings and next proposals

These are **historical findings**, not a claim that the latest 324-person build is balanced. The user requested several simulated games and proposals. Eight matched cases completed on the earlier 152-person / 36-business version. Each had a shared 24h warmup, then 48h of investment decisions, ending at hour 72. Local Laya computed 38,698 requests; 43,152 exactly identical requests reused those responses. No synthetic model answers were substituted.

Starting player wealth was $2,200. Final wealth includes cash plus whole-dollar liquidation quotes for each remaining holding.

| Policy | Ordinary, seed 1963 | Adverse, seed 1964 | Wins, ordinary / adverse |
|---|---:|---:|---:|
| Hold cash | $2,200 | $2,200 | 0 / 0 |
| Random legal bids | $2,523 | $641 | 29 / 12 |
| Revenue trend | $2,230 | $2,651 | 2 / 1 |
| Conservative informed | $2,200 | $1,697 | 0 / 1 |

The informed policy did not establish an advantage. In the ordinary case it barely participated; in the adverse case it held one declining investment while the trend policy sold in stages. The adverse town ended with 28–29 survivors; ordinary ended with 99–109. These are two scenario seeds, not a statistically reliable ranking. Financing choices also alter the later economy, so policy paths legitimately diverge.

A later 162-person / 41-business ordinary run reached hour 48 with 124 residents, one failed business, 50 funded rounds and 130 AI partial sales under the earlier six-hour sale cadence. Its adverse companion reached saved hour 44 with 74 residents before an invariant caught negative hunger at hour 45. The original neighbor-help mutation was then clamped and regression tested. Neither run uses the latest doubled population, value outlook, hourly exits or sleep skip.

The latest requested changes directly address several findings: more customers/data, higher valuation weight on profitable earnings, a bounded growth outlook for bidding, hourly capital recycling, late businesses, batch pitch handling and skipped quiet hours. They need fresh matched evaluation.

## Proposals worth testing next

1. **Make ordinary survival steadier before adding harder disasters.** Track why residents leave or die, especially the second-night food/energy cycle. Test modest food-budget protection and better needs-based decisions; avoid unconditional extra revenue or guaranteed rescues. Aim for an ordinary town that stays populated over several days while poor businesses can still fail.
2. **Separate manageable disruption from catastrophic events.** The flu/shortage sequence overwhelmed the earlier town. Try shorter outbreaks or recoverable health penalties in the normal difficulty, preserving a clearly labeled severe scenario. Measure recovery time and business churn, not just survival at the end.
3. **Show why a business could grow.** Add a small latest-period trend chart, owner delivery progress, repeat-demand signal and an explained outlook range. All should use the same observed data available to AI. This would make premium bids understandable and give the player something to evaluate beyond a current mark.
4. **Give rivals different sale behavior.** Hourly choice is now implemented. Check whether the small model selects immediate exits too uniformly. If so, expose each firm's horizon, cash needs and risk tolerance more clearly, with actual decision logs. Avoid forcing holds merely to make competitors look active.
5. **Make funded improvements easy to follow.** A visible milestone such as “new screen opens in 3h” or “quality upgrade delivered” can connect a financing decision to later capacity, customer satisfaction and earnings. Use the actual plan timing and realized effect.
6. **Use the new nightlife for a distinct demand cycle.** Compare dinner, cinema and bar attendance, ticket income, repeat visits and next-day energy. Add showtimes or scheduled live sets only if the basic late attendance is working; capacity and customer budgets should matter.
7. **Offer alerts without taking over decisions.** Optional alerts for a completed upgrade, deteriorating margins or a large gain could help players react. Bids and sales should remain explicit unless a future user explicitly opts into automatic orders.

Before adopting further balance changes, rerun equal-horizon ordinary/adverse seeds on the final build, report purchase counts, competitive auctions, owner execution, realized returns, failure rates and population, and keep a cash-only baseline. There is no basis yet to promise that an informed strategy consistently wins.
