# ICT University

Page's study library for the ICT / PJ Trades liquidity model on NQ, MNQ, and Micro Gold. Two AI tutors (Claude and ChatGPT) teach from these files so they both work from the same material.

**If you are an AI tutor, start here:** `00-for-the-tutors/tutor-instructions.md`, then `00-for-the-tutors/how-page-learns.md`.

## What's in here

| Folder | What it holds |
|---|---|
| `00-for-the-tutors/` | How to teach Page. Voice, structure, rules, and how she learns best. Read first. |
| `01-pj-trades-playbook/` | PJ Trades' model. The core playbook, the glossary, the four entry models, and notes from his live stream. |
| `02-ict-2022-mentorship-notes/` | Study notes on all 41 episodes of the ICT 2022 Mentorship, in 10 parts, plus the 2023 "One Setup For Life" bonus. |
| `03-page-orb-strategy/` | Page's own model: the 8:00 AM Gold ORB on MGC. Strategy doc, morning checklist, and the SMT framing that clicked for her. |
| `04-tradingview-indicators/` | Pine Script indicators built for her charts (session highs/lows, SMT spotter, FVG boxes, gap spotter, base hit ruler, and more). |
| `05-prop-firm/` | Notes on PJ's FuturesElite account and scaling guide, with honest context about the marketing side. |

## The model in one line

**Internal liquidity is where you ENTER. External liquidity is where you TARGET.**

Price sweeps a pool, snaps back (V-shape), flips a gap (inversion) or builds a breaker, and you enter on the retest with a small stop, targeting the next untagged high or low.

## The rules that never bend

- No untagged draw = no trade.
- Never trade the manipulation leg.
- Not the first 15 minutes of the open.
- Base hits pay the bills.
- Breaking a rule to get a trade on isn't trading. It's gambling.

## Mentorship notes, part by part

| Part | Covers |
|---|---|
| 01 | Ep 0 prep and mindset · Ep 1 elements of a trade setup · Ep 2 internal range liquidity and market structure shift |
| 02 | Ep 3 review examples · Ep 4 intraday order flow and the daily range · Ep 5–6 market efficiency paradigm, daily bias, consolidation hurdles |
| 03 | Ep 8 institutional order flow on forex · Ep 9 Power Three and NY PM · Ep 10 economic calendar and the open · Ep 11 live trade review, swing high classification |
| 04 | Ep 12 market structure for precision technicians · Ep 13 advanced price action in action · short clips · multiple setups per session · applying the model to EURUSD |
| 05 | Ep 18 chart layout and order blocks · Ep 19 DXY and purge-and-revert · Ep 20 London proof · Ep 21 risk-on/risk-off · Ep 22 SMT, tape reading, fib settings |
| 06 | FOMC day on micro NQ · Ep 24 the day the setup didn't form · Ep 25 rebalancing the previous day, premium entry rule · counter-trend long against daily bias |
| 07 | Ep 27 Friday PM counter-trend and self-talk · Ep 29 SMT long on ES, close proximity entries · Ep 30 Fed speech day · Ep 31 scout and sniper |
| 08 | Ep 32 consolidation day and the 3 o'clock setup · Ep 33 "I want to know that I know" · Ep 34 Sunday opening gap, fib the impulse leg · Ep 35 mean threshold, high resistance runs, SMT timing |
| 09 | Ep 36 done by Wednesday · Ep 37 NFP eve, the breaker, journaling · Ep 38 scalping vs day trading, full entry menu · Ep 39 Caleb's model |
| 10 | Ep 40 weekly bias and the economic calendar filter · Ep 41 risk management, stop management, send-off · 2023 bonus: session liquidity ranges |

## Indicators

| File | What it does |
|---|---|
| `session-high-low.pine` | Session highs/lows for Asia, London, NY plus the SMT spotter (hearts). Version 11. |
| `pj-liquidity-map-indicator.pine` | Same script, version 12. Newest copy. |
| `smt-spotter.pine` | The old standalone SMT spotter. Now merged into the session script above. |
| `fvg-15m.pine` | 15-minute fair value gap boxes with the CE line. |
| `pj-gap-spotter.pine` | Inversions only. Draws one blue zone: the newest gap that got closed through and flipped. Blue zone = wait for the retest. |
| `pj-base-hit-ruler.pine` | Shows what 25 points looks like on the chart. |
| `pj-two-lines-indicator.pine` | Yesterday's high and yesterday's low. One question: which one gets taken today? |
| `pj-teacher-indicator.pine` | The ICT 2022 model one lesson at a time: the clock, pools, sweeps, shifts, gaps, full sequence. |

Page's TradingView plan allows 5 indicators, so the SMT spotter was merged into the session script.

## Notes

- Nothing in here is financial advice or a trade signal. It is study material.
- Dollar figures in the playbook are from PJ's public trade reviews. The prop firm doc is a marketing document from PJ and is labeled as such.
- This repo is public so that ChatGPT can read it by link. Keep account details and anything private out of it.
