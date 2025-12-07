# Deploying Wordfall

This project is configured to deploy automatically to GitHub Pages using the `gh-pages` package.

## Prerequisites
- Node.js installed.
- Git repository connected to GitHub.

## How to Deploy

1.  **Open Terminal** in this folder (`wordfall`).
2.  **Run Deploy Command**:
    ```bash
    npm run deploy
    ```

### What this does:
1.  Runs `npm run build` (builds the app to `dist/`).
2.  Pushes the contents of `dist/` to a `gh-pages` branch on your repository.

## Verification
- Go to your GitHub Repository Settings > **Pages**.
- Ensure **Source** is set to "Deploy from a branch".
- Ensure **Branch** is set to `gh-pages` / `/(root)`.
- Your site will be live at: `https://abe-mart.github.io/wordfall/` (Note: Update this URL if your username differs).
