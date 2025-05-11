# How to Run GitHub Actions Locally Using `act`

This guide explains how to use [`nektos/act`](https://github.com/nektos/act) to run GitHub Actions locally on your machine for fast feedback and workflow testing.

## 🛠 Prerequisites

- Docker installed and running (compatible with Linux, macOS, or Windows)
- `act` installed: See the official documentation for installation instructions:  
  👉 https://github.com/nektos/act#installation

## ⚙️ Basic Usage

To run your default workflow locally:

```bash
act
```

To run a specific event:

```bash
act pull_request
```

To run a specific job from your workflow file:

```bash
act -j job-name
```

To run a specific workflow:

```bash
act -W workflow-file-name
```

## 🧪 Dry Run Mode

To preview what `act` will do without actually running the jobs:

```bash
act --dryrun
```

## 🐛 Troubleshooting

- `Cannot connect to the Docker daemon`: ensure Docker is running and you are not overriding `DOCKER_HOST`.
- `platform mismatch`: use `--container-architecture linux/amd64` when needed.

## ✅ Summary

| Command | Description |
|--------|-------------|
| `act` | Run all jobs locally |
| `act -j <job>` | Run a specific job |
| `act -W <workflow>` | Run a specific workflow |
| `act pull_request` | Simulate a PR event |
| `act --dryrun` | Preview actions without running |
