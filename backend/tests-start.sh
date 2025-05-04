#! /usr/bin/env bash

export PYTHONPATH=$(pwd)

set -e
set -x

alembic upgrade head

python tests/tests_pre_start.py

coverage run --source=app -m pytest
coverage report --show-missing
coverage html --title "${@-coverage}"
