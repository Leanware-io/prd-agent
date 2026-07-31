# Project Dependencies

## Core Dependencies

- `react` (^18.3.1)

  - Core React library for building user interfaces
  - Required for all React applications

- `react-dom` (^18.3.1)
  - React rendering for web browsers
  - Handles DOM-specific methods for React

## Development Dependencies

### Build Tools

- `vite` (^6.0.5)

  - Modern build tool and development server
  - Provides fast HMR (Hot Module Replacement)
  - Used for both development and production builds

- `@vitejs/plugin-react` (^4.3.4)
  - Official React plugin for Vite
  - Enables React-specific optimizations and features

### TypeScript Support

- `typescript` (~5.6.2)

  - JavaScript superset adding static types
  - Required for TypeScript compilation

- `@types/react` (^18.3.18)

  - TypeScript type definitions for React
  - Provides type safety for React code

- `@types/react-dom` (^18.3.5)
  - TypeScript type definitions for React DOM
  - Provides type safety for React DOM operations

### Linting and Code Quality

- `eslint` (^9.17.0)

  - JavaScript/TypeScript linter
  - Enforces code quality and consistency

- `@eslint/js` (^9.17.0)

  - ESLint's core JavaScript rules
  - Provides base linting functionality

- `eslint-plugin-react-hooks` (^5.0.0)

  - ESLint rules for React Hooks
  - Enforces Rules of Hooks

- `eslint-plugin-react-refresh` (^0.4.16)

  - ESLint plugin for React Refresh
  - Helps maintain state during HMR

- `typescript-eslint` (^8.18.2)

  - ESLint support for TypeScript
  - Provides TypeScript-specific linting rules

- `globals` (^15.14.0)
  - Global variables definitions
  - Used by ESLint for environment configuration

## Version Notes

- Core dependencies use caret (^) versioning to allow compatible updates
- TypeScript uses tilde (~) versioning for patch updates only
- All dependencies are using relatively recent versions
- React is on version 18.x which supports concurrent features
