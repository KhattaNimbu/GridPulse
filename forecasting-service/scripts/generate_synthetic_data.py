from __future__ import annotations

from app.config import DEFAULT_HISTORY_PATH
from app.synthetic import generate_synthetic_history


def generate() -> None:
    frame = generate_synthetic_history()
    print(f"Wrote {len(frame)} rows to {DEFAULT_HISTORY_PATH}")


if __name__ == "__main__":
    generate()
