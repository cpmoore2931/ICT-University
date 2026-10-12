"""Import tests: New York time, duplicates, bad rows, missing minutes."""

from __future__ import annotations

import sqlite3
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

import app


ROOT = Path(__file__).resolve().parent.parent
SAMPLE = ROOT / "data" / "weekly" / "MNQ_1m_2026-10-05.csv"


class ImportTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.folder = Path(self.tmp.name)
        self.conn = app.connect(self.folder / "test.sqlite")

    def tearDown(self) -> None:
        self.conn.close()
        self.tmp.cleanup()

    def test_new_york_daylight_and_standard(self) -> None:
        summer = app.to_new_york(app.parse_timestamp("2026-10-05 13:30:00+00:00"))
        self.assertEqual(summer.strftime("%Y-%m-%d %H:%M"), "2026-10-05 09:30")
        self.assertEqual(app.session_day(summer), "2026-10-05")

        winter = app.to_new_york(app.parse_timestamp("2026-01-15 14:30:00+00:00"))
        self.assertEqual(winter.strftime("%Y-%m-%d %H:%M"), "2026-01-15 09:30")

        july = app.to_new_york(app.parse_timestamp("2026-07-15 13:30:00+00:00"))
        self.assertEqual(july.strftime("%Y-%m-%d %H:%M"), "2026-07-15 09:30")

        # Sunday 6:00 PM ET is the Monday session.
        sunday = app.to_new_york(app.parse_timestamp("2026-10-04 22:00:00+00:00"))
        self.assertEqual(sunday.strftime("%H:%M"), "18:00")
        self.assertEqual(app.session_day(sunday), "2026-10-05")

    def test_bad_row_is_skipped_and_good_rows_stay(self) -> None:
        path = self.folder / "MNQ_1m_2026-10-05.csv"
        path.write_text(
            "timestamp,open,high,low,close,volume\n"
            "2026-10-05 13:30:00+00:00,100,101,99,100.5,10\n"
            "not-a-time,1,1,1,1,1\n"
            "2026-10-05 13:31:00+00:00,100.5,102,100,101,8\n"
            "2026-10-05 13:32:00+00:00,1,1,5,1,1\n",
            encoding="utf-8",
        )
        added, skipped, notes = app.import_file(self.conn, path)
        self.conn.commit()
        self.assertEqual(skipped, 2)
        self.assertEqual(added, 2)
        self.assertTrue(any("skipped 2 bad rows" in note for note in notes))
        count = self.conn.execute("SELECT COUNT(*) AS n FROM bars_MNQ").fetchone()["n"]
        self.assertEqual(count, 2)

    def test_overlap_skips_duplicate_timestamps(self) -> None:
        one = self.folder / "MNQ_1m_2026-10-05.csv"
        two = self.folder / "MNQ_1m_2026-10-06.csv"
        row = "2026-10-05 13:30:00+00:00,100,101,99,100.5,10\n"
        header = "timestamp,open,high,low,close,volume\n"
        one.write_text(header + row, encoding="utf-8")
        two.write_text(
            header + row + "2026-10-05 13:31:00+00:00,100.5,102,100,101,8\n",
            encoding="utf-8",
        )
        app.import_folder(self.conn, self.folder)
        app.import_folder(self.conn, self.folder)
        count = self.conn.execute("SELECT COUNT(*) AS n FROM bars_MNQ").fetchone()["n"]
        self.assertEqual(count, 2)

    def test_missing_minutes_become_a_note(self) -> None:
        path = self.folder / "MNQ_1m_2026-10-05.csv"
        path.write_text(
            "timestamp,open,high,low,close,volume\n"
            "2026-10-05 14:00:00+00:00,100,101,99,100,1\n"
            "2026-10-05 14:01:00+00:00,100,101,99,100,1\n"
            "2026-10-05 14:04:00+00:00,100,101,99,100,1\n",
            encoding="utf-8",
        )
        notes = app.import_folder(self.conn, self.folder)
        self.assertTrue(any("missing 2 minutes" in note for note in notes))

    def test_garbage_file_does_not_crash(self) -> None:
        path = self.folder / "MNQ_1m_junk.csv"
        path.write_bytes(b"\xff\xfe not csv at all \x00\x01")
        notes = app.import_folder(self.conn, self.folder)
        self.assertTrue(notes)

    def test_unknown_name_is_a_note(self) -> None:
        path = self.folder / "prices.csv"
        path.write_text(
            "timestamp,open,high,low,close,volume\n"
            "2026-10-05 13:30:00+00:00,1,2,1,2,1\n",
            encoding="utf-8",
        )
        notes = app.import_folder(self.conn, self.folder)
        self.assertTrue(any("needs MNQ" in note for note in notes))
        count = self.conn.execute("SELECT COUNT(*) AS n FROM bars_MNQ").fetchone()["n"]
        self.assertEqual(count, 0)

    def test_sample_week_builds_five_days(self) -> None:
        if not SAMPLE.exists():
            self.skipTest("sample csv missing")
        notes = app.import_file(self.conn, SAMPLE)[2]
        self.conn.commit()
        notes.extend(app.missing_minute_notes(self.conn))
        days = app._days(self.conn, "MNQ")
        keys = sorted(str(day["day"]) for day in days)
        self.assertEqual(
            keys,
            ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"],
        )
        self.assertFalse(any("bad" in note for note in notes))
        self.assertFalse(any("missing" in note for note in notes))
        monday = app.session_payload(self.conn, "MNQ", "2026-10-05")
        tuesday = app.session_payload(self.conn, "MNQ", "2026-10-06")
        assert monday is not None and tuesday is not None
        self.assertIsNone(monday["pdh"])
        self.assertIsNotNone(tuesday["pdh"])
        start = datetime.fromtimestamp(int(monday["start"]), app.NY)
        self.assertEqual(start.strftime("%H:%M"), "04:00")
        self.assertEqual(app.label_day("2026-10-05"), "Mon Oct 5")

    def test_passed_status_does_not_downgrade(self) -> None:
        app.set_practice(self.conn, "MNQ", "2026-10-05", "practiced")
        app.set_practice(self.conn, "MNQ", "2026-10-05", "passed")
        app.set_practice(self.conn, "MNQ", "2026-10-05", "practiced")
        row = self.conn.execute("SELECT status FROM practice").fetchone()
        self.assertEqual(row["status"], "passed")


if __name__ == "__main__":
    unittest.main()
