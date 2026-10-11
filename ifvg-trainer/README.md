# IFVG Trainer

Practice one futures model on your own 1-minute data.

Times on the chart are New York time.

## Run it

You need Node.js 20 or newer, and Python 3.

```bash
cd ifvg-trainer
npm start
```

Open [http://127.0.0.1:8787](http://127.0.0.1:8787).

## Drop a week

Put the CSV here:

`ifvg-trainer/data/weekly/`

Name it with the symbol, like `MNQ_1m_2026-10-05.csv`.

Columns:

`timestamp,open,high,low,close,volume`

Timestamps are UTC, like `2026-10-05 13:30:00+00:00`.

Symbols: MNQ, NQ, MGC, GC.

Then click **Load new week**. The app also scans that folder when it starts.

A sample MNQ week (Oct 5–9, 2026) is already in the folder.

## What you should see

1. Big day cards. Example: **Mon Oct 5**.
2. A dot on each card. Gray = new. Yellow = practiced. Green = passed.
3. Click a day. The chart starts at **4:00 AM ET**. Later candles stay hidden.
4. Lines are already on the chart: Asia, London, Pre, previous day, and equal highs and lows.
5. **This week** plays the latest 5 days, Monday through Friday, one at a time.
6. **Step** moves one bar. **Play** runs at 1x, 5x, or 20x. Use 1m, 5m, or 15m.
7. The chart labels the steps as they happen: **1 DOL**, **2 Sweep**, **3 V-shape**, **4 Inversion**, **5 Retest**.
8. Tick those same steps in order. Set entry, stop, and target. Then press **Enter**.
9. If you press **Enter** too early, the screen says **NOT A SETUP**.
10. A bad row or a missing minute shows a yellow note. The app keeps going.

Green means you passed the checklist for that day. Yellow means you stepped the chart at least once.

## Levels

- Asia: 8:00 PM–12:00 AM ET
- London: 2:00 AM–5:00 AM ET
- Pre: 4:00 AM–8:30 AM ET
- Day: previous futures session high and low
- Equal highs and lows: matching swings that price has not taken yet

Lines update as you step. They never use future bars.
