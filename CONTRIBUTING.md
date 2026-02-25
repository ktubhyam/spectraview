# Contributing to SpectraView

Thank you for considering contributing to SpectraView! This document outlines how to get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Start development (watch mode):
   ```bash
   npm run dev
   ```

## Storybook

SpectraView uses [Storybook](https://storybook.js.org/) for interactive component development and documentation.

```bash
npm run storybook        # Start dev server on http://localhost:6006
npm run build-storybook  # Build static Storybook site
```

When adding or modifying a component, add or update the corresponding story in `src/stories/`. Each component should have stories covering its main states (default, dark theme, edge cases).

## Making Changes

1. Create a new branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Run the full check suite:
   ```bash
   npm run typecheck
   npm run test:run
   npm run build
   ```
5. Create a changeset describing your changes:
   ```bash
   npx changeset
   ```
6. Submit a pull request

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation changes
- `test:` — Test additions or changes
- `refactor:` — Code refactoring
- `chore:` — Build/tooling changes

## Code Style

- TypeScript strict mode, no `any` types
- Functional components with hooks
- All public APIs must have JSDoc comments
- Tests use Vitest + React Testing Library
- All new components should have both tests (`__tests__/`) and stories (`src/stories/`)

## Reporting Issues

Please use [GitHub Issues](https://github.com/ktubhyam/spectraview/issues) to report bugs or request features.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
