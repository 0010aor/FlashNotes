# Contributing to FlashNotes

Thank you for your interest in contributing to FlashNotes! We welcome contributions from everyone. By participating in this project, you agree to abide by our code of conduct (we should add one!).

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/0010aor/FlashNotes/issues). If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, please search the [Issues](https://github.com/0010aor/FlashNotes/issues) to see if it has already been suggested. If not, open a new issue, providing a clear description of the proposed enhancement and its potential benefits.

### Code Contributions

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/0010aor/FlashNotes.git
    ```
3.  **Set up the development environment** by following the instructions in the [README.md](README.md#setup-instructions).
4.  **Install pre-commit hooks**: After setting up the environment, run the following command in the project root to enable automatic code style checks before each commit:
    ```bash
    # If you installed pre-commit via pip
    pre-commit install
    # Or if you are using uv to manage pre-commit
    # uv run pre-commit install
    ```
5.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b name-of-your-feature-or-fix
    ```
6.  **Make your changes**. Ensure your code follows the project's style guidelines.
7.  **Write tests** for your changes. For the backend, we use Pytest. Ensure all tests pass.
8.  **Commit your changes**:
    ```bash
    git commit -m "feat: Describe your feature" -m "Detailed description of the changes."
    # Or for a fix:
    # git commit -m "fix: Describe your fix" -m "Detailed description of the fix."
    ```
    (Consider using [Conventional Commits](https://www.conventionalcommits.org/) for commit messages).
9.  **Push your branch** to your fork:
    ```bash
    git push origin name-of-your-feature-or-fix
    ```
10. **Open a Pull Request (PR)** to the `main` branch of the original repository. Provide a clear title and description for your PR, linking to any relevant issues.

## Code Style

*   Please ensure your code is formatted correctly before committing.
*   Backend (Python): Follow PEP 8 guidelines. We use Ruff, configured in `backend/pyproject.toml`.
*   Frontend (TypeScript/React): We use [Biome](https://biomejs.dev/) for linting and formatting. Please ensure your code adheres to the configuration in `frontend/biome.json`. Key aspects include:
    *   2-space indentation.
    *   100-character line width.
    *   Single quotes for TS/JS, double quotes for JSX.
    *   Trailing commas on multiline structures.
    *   Adherence to recommended linter rules (with specific rules like `noExplicitAny`, `noArrayIndexKey`, and `noNonNullAssertion` set to generate warnings).

## Testing

*   Backend: Ensure all backend changes are covered by tests using `pytest`. Run tests from the `backend` directory.
*   Frontend: (Add details about frontend testing if applicable, e.g., Vitest, React Testing Library).

Thank you again for your contribution!
