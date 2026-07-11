import unittest
from unittest.mock import patch

import pandas as pd

from app.dataset import station_history


class StationHistoryTests(unittest.TestCase):
    def test_station_history_regenerates_history_for_missing_station(self):
        frame = pd.DataFrame(
            [
                {"station_id": "station-a", "ds": pd.Timestamp("2024-01-01"), "y": 10.0, "sessions": 1},
            ]
        )

        synthetic_frame = pd.DataFrame(
            [
                {"station_id": "station-b", "ds": pd.Timestamp("2024-01-01"), "y": 12.0, "sessions": 1},
            ]
        )

        with patch("app.dataset.generate_synthetic_history", return_value=synthetic_frame) as generate_mock:
            result = station_history(frame, "station-b")

        self.assertEqual(result["station_id"].tolist(), ["station-b"])
        generate_mock.assert_called_once()


if __name__ == "__main__":
    unittest.main()
