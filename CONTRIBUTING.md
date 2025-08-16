# Contributing

Thank you for contributing!

## Prerequisites

- Node.js 20 (see `.nvmrc`)
- Yarn (classic)

## Setup

```bash
cp .env.example .env
yarn install
```

## Scripts

- `yarn lint` — run ESLint if configured
- `yarn lint:fix` — fix lint issues
- `yarn format` — format files with Prettier
- `yarn build` — build (if configured)
- `yarn test` — run tests (if configured)

## Pull Requests

- Keep PRs focused and small where possible
- Update docs as needed
- Ensure CI passes

## Code Style

- Prettier formats code automatically on commit via lint-staged
- ESLint enforces code quality (existing configuration is respected)

## Security

- See `SECURITY.md` for how to report vulnerabilities
