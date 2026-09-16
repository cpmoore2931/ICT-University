# PJ Trades — Core Playbook

Source: transcripts of PJ's premium onboarding course + YouTube trade reviews, provided by
Page. This is the reference doc for how PJ trades.

> **Important reframe (added after the trade-review transcripts):** the IFVG is not the
> model — it's *one entry trigger inside* the model. The actual master framework is
> **internal liquidity → external liquidity**. He says it plainly: "this is my bread and
> butter, it's what I teach here on the channel, it has made me a ton of money."

---

## 1. The master framework: Internal → External

**Internal liquidity** = the inefficiencies *inside* a leg — fair value gaps, imbalances,
order blocks. These are the **entry zones**.

**External liquidity** = swing highs and swing lows, overnight highs/lows, relative equal
highs/lows. These are the **targets**.

**The trade is always: price retraces into internal liquidity → you enter there → you
target external liquidity.**

His words: "you wait for an internal equity point to be formed… then you drop down onto the
lower timeframes to find a model that will draw back up into [the external high]."

### How he frames a sell-side / buy-side imbalance
An imbalance is a **defense level**. A sell-side imbalance is where the bears defend — price
comes back up into it, they swat it down, and you ride the next leg lower. Buy-side imbalance
is the same thing for bulls. This is the mental model for *why* the entry zone works.

### The four-step sequence
1. **Identify the higher-timeframe context** — is price sitting in / pulling back into an
   HTF PD array? (daily FVG, 4h FVG, 1h FVG). He'll check daily → 4h → 1h.
2. **Identify the internal liquidity pool** you'll enter from — the FVG/imbalance inside the
   current leg.
3. **Identify the external draw** — an *untagged* swing high/low or overnight level. **This
   is half the battle.** If there's no clean draw, there's no trade.
4. **Drop to the lower timeframe (5m → 1m → 30s)** and find a specific entry model.

---

## 2. Entry models (his "arsenal")

He names four: **fair value gaps, inverted fair value gaps, breaker blocks, and unicorns.**

### 2a. IFVG — Inverted Fair Value Gap
An FVG that price displaces *through*, flipping its polarity. Bullish FVG broken down becomes
resistance; bearish FVG broken up becomes support. **Entry is the retest of the inversion.**

Full sequence (short side): sweep of an overnight high → into an HTF PD array → V-shaped
recovery → the FVG left behind on the manipulation leg gets displaced through → retest of
that inversion = short → stop above the gap → target the external draw below.

Mirror it exactly for longs.

### 2b. Breaker block
Forms at a major swing point after a liquidity sweep. Structure: **low → high → lower low →
new higher high** (bullish breaker). That final break confirms it.

**How he draws it:** the **two highest up-close candles** before the leg down that took the
liquidity. **Use the candle bodies, not the wicks.**

### 2c. Unicorn
**A fair value gap sitting inside a breaker block.** Higher probability than a plain breaker.
Entry = pull back into the FVG portion of the breaker; stop below the breaker.

### 2d. CSD — Change in State of Delivery
When price takes out the swing high (or low) opposite the sweep, delivery has flipped
direction. He uses this as the confirmation step between the V-shape and the entry. He'll
reference a "30-second change in the state of delivery" as a micro-confirmation.

### 2e. Front-run entry ⚑ (major addition)
Sometimes waiting for the confirmed inversion **destroys the risk/reward** — the confirming
candle closes so far into the move that the entry is now below your target. In that case he
**front-runs**: entering at the rejection *before* the inversion technically confirms, and
running the stop just above/below the rejection candle.

**When he does it:**
- The **draw on liquidity is close** to the setup ("this works extremely well when I can
  forecast a draw on liquidity that is close to where my trade is")
- He gets a clean rejection candle out of the zone (e.g. a bearish doji closing off the 5m
  imbalance)
- Waiting for the inversion would produce a nonsense entry

**What it costs you:** confirmation. He calls it "feel" — years of watching candle closures,
volume, and the DOM. He's explicit that this part is not learnable overnight.

**Real example:** 27-point stop for an 83-point move (~1:3) via front-run, vs. the confirmed
1-minute inversion entry that would have been unusable.

### 2f. Continuation model
After the market has taken a liquidity pool and reversed, it pulls back into an internal
imbalance and *continues* in the reversal direction. The 5m sell-side imbalance created at the
open is the classic version: aggressive open selloff → dead cat bounce back into that
imbalance → V-shape out of it → continuation lower to the next overnight low.

**The proximity condition:** this works best when overnight highs/lows sit **within ~50–100
points of each other**. Market takes London low, leaves Asia low untagged 50 points below →
that untagged pool is the draw for the continuation.

**The disqualifier — say this out loud before every one of these:** *if the draw was already
tagged, the trade doesn't exist.* He repeats this twice: "if this Asia low had already been
tagged, this trade doesn't make sense anymore."

### 2g. Connecting flight model
When **both** overnight pools (London high *and* Asia high) get taken at roughly the same
time, the market has cleared the liquidity above and now likely needs to pull back into an
internal PD array. Combine with an **SMT check on ES** — if the S&P is stalling/consolidating
while NQ ran, the pullback is more likely to be a real reversal than a continuation.

---

## 3. Confluences that upgrade a setup

- **Sweep lands in a PD array** (5m/15m/1h FVG) — textbook.
- **SMT divergence** — NQ takes its London high, ES fails to take its own. Checked on the 15m
  at overnight highs/lows. A *clue*, not a requirement.
- **Trade the weaker index.** In one review he shorted NQ specifically *because* NQ hadn't
  swept liquidity while ES had. ES is "the big brother" — it shows what's really happening.
- **LRLR below/above** — stacked wicks, low-resistance liquidity. He loves targeting these.
- **CE hold** — price repeatedly holding above/below the 50% of a gap over hours = that gap
  has strength. Count the wicks: "1, 2, 3, 4, 5 — there's like 10, 15 wicks in that zone, all
  holding consequent encroachment."
- **Two inversions in quick succession** (e.g. two 5m gaps inverting within 15 minutes) =
  strong directional confirmation.
- **Historical chop zones / bookmap levels** — old ugly ranges act as resistance and as good
  exit targets.
- **BPR** — he explicitly calls this **optional**. "I don't really even use BPRs in my
  checklist." Worth marking, not worth waiting for.

---

## 4. Timeframe workflow

| Timeframe | Job |
|---|---|
| Daily / 4h / 1h | Context. Is price in an HTF FVG? Did it tag CE and reverse? |
| **15m** | His favorite. "If the 15-minute was the last timeframe for me to trade, I'd do just fine." Structure, SMT, the primary imbalance. |
| 5m | The zone. Where the tradeable imbalance/inversion usually lives. |
| 1m | Confirmation. Watching how candles close into the 5m zone — long wicks = pressure present. |
| 30s | Execution. The cheap entry — a 30s inverse off a 5m inversion gives a tiny stop. |

**The layering pattern that shows up repeatedly:** 5m inversion defines the zone → 1m confirms
rejection → 30s inverse is the trigger. That's how he gets 5-point stops on 16-point targets.

---

## 5. Trade management

- **Minimum target: 1:2 RR.** He'll take 1:1 in bad conditions.
- **At 1:2, two valid choices:**
  1. Close the whole thing. Totally appropriate.
  2. Multiple contracts — take one off, **move stop to breakeven**, let the runner go to the
     external draw.
- **Do not micromanage the runner.** "Don't get scared about pullbacks — we're already
  risk-free."
- **Let winners run as long as they can, cut losers as fast as you can.**
- **Exit into gaps / chop zones.** He targets a 15m FVG as an exit precisely because he knows
  buyers are waiting there and it'll turn choppy. Gaps are good *exits*, not just entries.
- **Cut early if the follow-through isn't there.** He took a 1:1 because the next candle after
  his target zone didn't explode toward the draw — and Trump news dropped a 200-point candle
  minutes later. "Without that explosion, it's hard for me to want to hold."
- **Average trade time: ~7 minutes.** One review: entry to full TP in 3 minutes.
- He **copy trades across multiple accounts** (3 in one example).

---

## 6. Rules & filters (the "don't" list)

1. **No trading the first 15 minutes of the open.** "Highly manipulated, highly confusing,
   loves to trap people, then goes the opposite direction." He passed on a clean-looking
   inversion because of this rule and said so on camera.
2. **Don't trade chop / "barcode central."** Wait for the market to break in a direction.
   "It is death by a thousand stabs."
3. **Don't trade without a draw on liquidity.** Untagged draw or no trade.
4. **Don't trade the manipulation leg.** Wait for it to complete.
5. **Don't trade low-probability sessions.** He sat out an entire day (NY PM "seeking and
   destroying") and it was the right call — the next day delivered 101 points cleanly.
6. **Don't flip your bias immediately after a stop-out.** He calls this "a very dangerous
   thing to do." Getting caught in the manipulation leg is *information* — often the better,
   cheaper setup is right behind it.
7. **You must have a written ruleset and checklist.** "If you're going to break your rules
   just to get a trade on, you're not trading, you're gambling."

---

## 7. Regime adaptation

He is explicit that conditions change and you adapt or die:

- **Good regime** (trending, clean follow-through) → hold for the full external draw, 1:3+.
- **Bad regime** (summer 2026: Iran headlines, SpaceX added to NDX, no follow-through) →
  **base hits.** Take the 1:1. "You cannot go broke taking profits."
- **His own adaptations during bad PA:** sized down, **switched from NQ to ES** because ES was
  cleaner/less volatile, shut off the live account and traded evals to gather information
  without risking capital.
- He notes he's traded 10 years and *still* adapts every cycle. The summer months are where
  most traders quit — that's the framing he keeps returning to.

---

## 8. Special situations

**Data wick / "Trump wick."** An economic release (or a Trump tweet) creates a spike high and
low. The market tends to come back for **both sides** — resting liquidity exists in both
directions. Mark the data wick high and the data wick low.

**Fraudulent sweep.** Price wicks above a level but gets **no candle closures above it**. He
still treats that level as a live draw on liquidity, because the resting orders are likely
still there. Bonus when another pool (e.g. NY PM high) sits just above it.

**Trendline liquidity / wedge break.** A bearish flag or wedge with stops along the diagonal —
he waits for the break, then a 5m inverse to confirm bears are actually in control.

**Which inversion to trade when there are several.** The one that held the longest with the
most wicks respecting CE carries more weight — that's the retest he wants.

---

## 9. Daily prep routine

Done **before the open**, using the *ICT Killzones & Pivots (TFO)* indicator, then turn the
indicator off and keep only your manual markings.

| Session | Time (ET) |
|---|---|
| Asia | 8:00 PM – 12:00 AM |
| London | 2:00 AM – 5:00 AM |
| New York AM | 8:30 AM – 12:10 PM |
| Lunch | 12:00 – 1:00 PM |
| New York PM | 1:30 – ~3:34 PM |

**Mark manually with the ray tool:**
- Asia high / low, London high / low
- Prior day NY AM high / low, NY PM high / low
- **True day open** (midnight opening price)
- **8:30 opening price**
- Relative equal highs/lows, LRLR zones
- Data wick high / low if there was a release

Only mark what's **untagged**. "If it's not drawn on your charts, you're trading blind."

---

## 10. Chart & platform setup

**TradingView** — Essential plan minimum, **live data required** (otherwise 10-min delayed).

**Watchlist:** NQ, ES, MNQ, MES on the **current front month** (not `NQ1!`). Rollovers
announced in Discord.

**Tick values:** NQ $20/pt · ES $50/pt · MNQ $2/pt · MES $5/pt. Tick = 0.25 pt on all four.
New traders start on micros.

**Indicator settings (ICT Killzones & Pivots — TFO):** session drawing limit 4, timeframe
limit 1h, timezone GMT-4, label size small, drawing cutoff on, NY AM killzone 8:30, NY AM
close 12:10, opening prices = true day open + 8:30, timestamps first box checked.

**Templates to build (rectangle + ray tool):**
- **FVG boxes** — one per timeframe (1m/2m/3m/5m/15m/1h/4h), yellow, 18% opacity, **middle
  line on** (this is your CE), text = timeframe + FVG, inside-right, size 10 italic
- **Inversion boxes** — pink, 18% opacity, middle line on, text "inversion"
- **Liquidity rays** — black, thinnest, extend-right off, labeled "London High," "Asia Low," etc.
- **Midnight** — dashed black · **8:30 opening price** · **Order block** — dashed blue

Timeframes pinned monthly → 30s. Favorites bar loaded so markup is fast in real time.

---

## 11. Observed trade stats (from the reviews)

| Trade | Stop | Target | RR | Result |
|---|---|---|---|---|
| Breaker/unicorn long → London high | 345 pts (micro sizing context) | — | ~1:5 held | ~$1,800 |
| Front-run continuation short → Asia low | 27 pts | 83 pts | ~1:3 | $4,800 in 3 min |
| Connecting-flight short → 15m gap | 24–25 pts | 65 pts | ~1:2.6 | $6,500 |
| Internal→external short (after a 49-pt loss) | 36 pts | 101 pts | ~1:2.8 | $10,000 |
| Base hit long (chop regime) | 34 pts | ~34 pts | 1:1 | $3,145 |
| ES 30s inverse off 5m inversion | 5 pts | 16.75 pts | ~1:3 | eval account |

Note the stop sizes: mostly **5–36 points**. The edge is in the cheap entry, not the big
target.

---

## 12. Still undefined (worth pinning down)

Several earlier gaps are now answered — these remain:

1. **Position sizing / risk per trade as a rule.** Still never stated as a % or fixed $. He
   copy-trades multiple accounts and "sizes down" in bad regimes, but there's no stated rule.
2. **What counts as "strong displacement"** vs. a weak poke through a gap. Still judgment.
3. **How long an inversion stays valid** before it's stale, and how many retests are too many.
4. **Max trades per day / daily loss limit.** He took 3 trades in one session with 2 losses
   and kept hunting — but that was an eval, and he said on a funded account he "maybe would
   have shut it down." No hard number.
5. **How to decide front-run vs. wait for confirmation** in a rule-based way. He attributes it
   to feel. This is the single biggest gap between watching him and executing yourself.
6. **When a 1:1 base hit is correct vs. holding for the draw** — regime-dependent, no
   mechanical trigger given.

---

*Last updated: 2026-08-16*
