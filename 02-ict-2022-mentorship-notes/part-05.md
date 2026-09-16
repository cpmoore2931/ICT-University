# ICT 2022 Mentorship — Study Notes, Part 5

Continues parts 1–4. Episodes 18–22-ish. Short, simple, visual — see claude/how-page-learns.md.

---

## ICT Episode 18 — Chart Layout, Order Blocks Done Right (EURUSD walkthrough)

### His TradingView workspace
- Upper left: DAILY. Lower left: HOURLY. Right (biggest): **15-min — the bellwether.**
- Link the charts (chain icon) so annotations drawn once appear on every timeframe. Works fine on ONE screen too: annotate daily → switch to hourly → switch to 15m; everything carries down.
- Phone: managing an open trade is OK. ENTERING new trades on a phone: no. You can't see the land.

### Previous 3 days' highs and lows (old-school ICT, still gold)
Mark the last 3 daily highs and lows. HFT algorithms attack previous days' highs/lows. Do this and you'll NEVER run out of setups — a fresh liquidity pool every day.

### Touching is enough
The daily FVG only needs to be TOUCHED — you don't need a deep fill or the midpoint. Greedy limit orders miss fills. Take the low-threshold entry; the risk is bigger in pips but YOU control the leverage.

### Killzone = decision window, not fill window
- The killzone is when you DERIVE the trade and PLACE the order. The FILL can come later (his example filled at 2:45 PM).
- No valid order idea by ~11:30? **Pull the order. Never leave it good-till-cancelled.** A stale order filling at the wrong time of day is how you get run over.

### Order block — the full validity checklist (final form)
1. It's the **consecutive candle series**, not the last candle.
2. It MUST have an **imbalance/FVG** with it. No imbalance = no order block. (This is why it is NOT supply & demand — no "fresh zone" nonsense; he'll cut through candles and still trade it.)
3. It needs the **narrative** (drawing toward liquidity).
4. Anchor = where the **change in the state of delivery** happens (the series' opening price).
5. Stop goes above the intermediate-term high (the swing high with the imbalance — the one that "should not be exceeded").
- Why the last up-close candle often never gets touched: the higher-timeframe parent imbalance stops price first. Parent rules child, always.

### Two bears in the snow
Setups repeat like bear tracks: never identical, always recognizable. Your journal is you learning to recognize the prints.

---

## ICT Episode 19 — The Blended Video (DXY roadmap, "nothing charts," purge & revert, opening prices)

### The dollar index as the compass
- Long-term bullish DXY → bearish every foreign currency. Targets called: 100 ✓, 101 ✓, ~103 next.
- The famous call: "If I were making the market, I'd dip it below 100 into **99.92–99.95** to convince everyone the dollar topped — then run it higher."
- He does NOT pick tops/bottoms. Wrong-by-not-guessing keeps him on the right side of order flow.

### The GBPUSD lesson: NOTHING is a valid read
- He put up the pound chart and said: there is NOTHING here. Zero. Sloppy, muddy, choppy = close the charts, go live your life.
- A market acting like that is a rattlesnake on the trail — back away. He hadn't touched his favorite pair in MONTHS.
- Forex overall was asleep (supply-chain era) → he navigates to where volatility lives (indices). Asset classes rotate; go where the movement is, no "team futures vs team forex."

### The coin-flip point
Flip a coin for direction, risk ½%, aim 1%, 30-pip stop — surprisingly hard to blow up. Lesson: **money management does the heavy lifting.** Most "profitable systems" are really just good money management plus rule adherence.

### ES setup he called (purge & revert)
- Daily traded down to ~50% of the dealing range (equilibrium/short-term discount) → next day bias = bullish.
- **Purge & revert:** purge the sell stops below the short-term low → revert to the high of the last 3 days.
- Bearish daily order block target ladder (nearest first): the candle's **LOW → OPEN → MEAN THRESHOLD (50% of the OB) → HIGH (least likely — don't count on it).**

### Opening-price hierarchy (bullish day)
- Want to buy BELOW the midnight NY open.
- If the 8:30 open is BELOW the midnight open and price dips under both = deeply discounted = the silver-platter setup.
- "**The last ditch for Power Three is 8:30.**"

### Demo-leverage sermon
- Running absurd leverage in paper trades = clout chasing = training toxic habits. Always use REALISTIC leverage, even in demo. The money is a derivative of doing the right things; focus on points and process.
- Journal self-talk stays 100% positive — you are deliberately writing "false memories" of seeing it coming. That's the design. Never a negative word in the journal.

### Contrarian students (aside)
Some of his students fade HIS bias at spots where retail believes a reversal — that's a personality-matched model, valid for them, NOT for new students. Learn trust of the higher-timeframe bias first; your own style emerges later.

---

## ICT Episode 20 — The London Proof (DXY 99.92 → EURUSD short)

**What this video is:** The 99.92 call from Episode 19 played out overnight. He shows the London-session setup it created.

### The intermarket trigger (this is PJ's SMT seed)
- DXY dropped into the called 99.92 zone (a buying level for dollar) at the EXACT moment EURUSD swept the **previous week's high**.
- Euro's poke above the old weekly high = **false breakout / turtle soup** — confirmed by dollar hitting its called level. Inverse partners moving to their levels together = the tell.

### London killzone mechanics (2–5 AM NY)
- High of day formed in the killzone (bearish day). Same model, earlier window.
- 2-min chart: displacement down through the short-term low FIRST → THEN the FVG counts. **No displacement away from the gap = no entry yet.** (He skipped an earlier low precisely because price hadn't moved away with energy.)
- Two FVGs stacked: enter at the lower one, stop above the upper one — allow the stab. Heat on the trade: ~5 pips.
- Targets: 50% of the parent leg first, then the deeper imbalance. Both hit.

### Risk framing
Fixed percent of equity, never dollars: **max 1%, prefer ¼–½% while learning.**

---

## ICT Episode 21 — Risk-On / Risk-Off + The Too-Heavy Day

### Risk-on / risk-off (the macro dial)
- **Dollar UP = risk OFF** → foreign currencies AND stock indices get heavy (money flees to the safe haven).
- **Dollar DOWN = risk ON** → risk assets breathe.
- So the DXY isn't just for forex — it's the barometer behind index trades too. His ES short thesis = dollar rallying + May seasonal weakness in stocks + daily bearish order block overhead.
- The bearish OB ladder worked again: price rejected at the mean threshold, never reached the OB high.

### The TOO-HEAVY day (the big new lesson)
Sometimes a bearish day never rallies above the midnight open OR the 8:30 open at all:
- That absence of a Judas swing is itself information: **extremely bearish.** Too heavy to mount any rally worth fading.
- On these days the model's ideal entry never appears. Your choices: enter on the small in-motion FVGs (takes courage and experience) — or miss it and tape-read. BOTH are acceptable. The model is not broken.
- His younger self blew accounts buying "oversold" on days like this. Heavy is heavy; indicators lie.
- 9:30 on a heavy day doesn't reverse anything — it just ACCELERATES what London started.

### His actual risk habits (worth copying)
- Typical hold time: **90 minutes to 2 hours, max.** In, take it, out, reassess.
- **No overnight holds. No weekend holds. Ever** (in this climate). Too much gap risk.
- Leaving the desk (took his wife to the airport)? **Flatten everything.** Don't manage trades from the road.
- Don't jam your stop tighter right after entry — you need TIME and PRICE in your favor before trailing.

### Missing moves is the job
He missed the afternoon leg (~$8k more) being a good husband. He missed Bitcoin's whole run he publicly called. You will miss huge moves forever. Give yourself permission to be human — the setups come back like buses.

---

## ICT Episode 22 — The April 29 Payoff: SMT, Reading the Tape, Fib Settings

**What this video is:** The relative-equal-lows draw he called for weeks finally got hit. He replays a live NQ short built on nested structure, names SMT out loud, and ends with the fib tutorial.

### Definitions locked in
- **Above an old high = premium. Below an old low = discount. Always.** (Someone asked how price above a high could be "premium" — that IS the definition.)
- But: overbought can stay overbought. Premium/discount only matters WITH narrative — why should price go where you think it's going TODAY (climate, calendar, volatility)?

### Permissible price action
Wicks may poke through an imbalance — that's fine. **The BODIES tell the truth.** Bodies staying inside the zone = the level is being respected. Learn to tolerate wicks or volatile markets will shake you out of every good idea.

### The live NQ short (reading the tape, start to finish)
1. Context: both indices drawing to the ES daily relative equal lows. Bearish everything.
2. Nested structure on the 5-min: long-term high, then a lower intermediate-term high (made ITH by its imbalance), then a lower short-term high → order flow predisposed DOWN.
3. Refined the 5-min bearish order block down to the 1-min. Entry as price hit the FVG edge + OB — filled within a QUARTER POINT of the level.
4. **Pyramided 3 → 2 → 1** (biggest first, always). The last add's 4.5 handles of heat didn't matter — five contracts of built-in equity sat behind it.
5. Exit: limit placed **just above** the target level — shallow runs can deny exact fills. It filled; he posted it in real time.
6. This whole shape = his **market maker sell model** (older students recognized it).

### SMT — named and taught (PJ's word too)
- Compare correlated markets at the same swing: NQ made a HIGHER high; ES refused to. Bearish + one index sweeping while the sister doesn't = **that run was a stop hunt** and the refusing index is showing real weakness.
- It "looks like divergence on an indicator, but it's PRICE." An x-ray of accumulation/distribution.
- TradingView how-to: add the second symbol in a new pane, set price source to HIGH to compare swing highs directly.
- Same as the Dow/NQ/ES "crack in correlation" from earlier — now with its name: **SMT.**

### The fib, calibrated (his exact usage)
- 0.5 = equilibrium (premium/discount line).
- **0.62 and 0.79 = the optimal trade entry (OTE) zone.**
- Standard deviations (-0.5, -1, -2) = projection targets below the fulcrum.
- **Anchor OTE on candle BODIES** (highest open/close ↔ lowest open/close), not wicks. The "he doesn't know how to use a fib" critics never understood this.

### Live streams (May) — ground rules he set
- Outlining the draw in real time, teaching only. NO trade calls, no entries on stream, chat ignored on purpose. Sometimes he'll be wrong — he WANTS students to see that so they stop expecting perfection.

### One more mindset anchor
Saturation fear is pointless: most people are lazy, undisciplined, and won't do the work — the algorithm doesn't change, and "there's a sucker born every second" keeps the liquidity flowing. The concepts stay constant.
