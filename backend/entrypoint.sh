#!/bin/sh
uv run ./prestart.sh
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
