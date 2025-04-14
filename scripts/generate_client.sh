#! /usr/bin/env bash

set -e
set -x

cd backend
python -c "import src.main; import json; print(json.dumps(src.main.app.openapi()))" > ../openapi.json
cd ..
mv openapi.json frontend/
cd frontend
npx biome format --write openapi.json
pnpm run generate-client
npx biome format --write ./src/client
