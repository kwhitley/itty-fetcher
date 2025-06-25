# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

itty-fetcher is a lightweight (~700 bytes) TypeScript library that wraps native fetch to reduce boilerplate. It's designed to simplify API calls while maintaining 100% native fetch compatibility.

### Key Architecture

- **Core Implementation**: `src/fetcher.ts` contains the main fetcher function using Proxy pattern for dynamic method handling
- **Entry Point**: `src/index.ts` exports everything from fetcher.ts
- **Test Utilities**: `src/test-utils.ts` provides Vitest mocking helpers for testing
- **Multi-format Build**: Rollup generates both ESM (.mjs) and CJS (.js) outputs with TypeScript declarations

The fetcher uses a Proxy-based approach where HTTP methods (get, post, put, patch, delete) are dynamically handled by `handleRequest()` function. This allows for a fluent API while keeping the bundle size minimal.

## Development Commands

### Testing
```bash
# Run tests in watch mode (primary development workflow)
bun dev

# Run tests once (CI/verification)
bun test
```

### Building
```bash
# Build the library (generates dist/ with .mjs, .js, and .d.ts files)
bun run build

# Verify build and run tests
bun run verify
```

### Linting
```bash
# Lint TypeScript files
bun run lint
```

### Release Process
```bash
# Standard release (patch version)
bun run release

# Next/beta release
bun run release:next
```

## Code Architecture Details

### Fetcher Function Structure
The main `fetcher()` function accepts either:
- A string (treated as base URL)
- An options object with properties like `base`, `fetch`, `parse`, `encode`, `after`

### Type System
- **Types Location**: `src/types.ts` (excluded from build)
- `FetcherOptions`: Union of string or options object
- `Fetcher`: Main interface with method calls that return Promises
- `ResponseHandler`: For after-request processing hooks
- `FetcherOptionsObject`: Core configuration options

### Request Processing Flow
1. `handleRequest()` processes method, URL, payload, and options
2. Combines base URL with request URL
3. Handles query parameters for GET requests
4. Serializes JSON payloads and sets content-type headers
5. Executes fetch with optional custom fetch implementation
6. Parses responses (JSON/text) unless `parse: false`
7. Runs after-request handlers if configured
8. Throws on HTTP errors (unlike native fetch)

## Testing

- **Framework**: Bun test (modern JavaScript runtime)
- **Test Files**: `*.spec.ts` files in `src/`
- **Structure**: Nested object-based test organization for comprehensive coverage
- **Mocking**: Uses Bun's built-in `mock()` function for fetch mocking
- **Test Pattern**: Recursive test runner with structured test trees for better organization

## Build System

- **Runtime**: Bun-first approach (Node.js compatible)
- **Rollup**: Multi-format builds (ESM/CJS) with TypeScript
- **Output**: `dist/` directory with multiple entry points
- **Package Exports**: Automatically generated based on source files
- **Bundle Analysis**: rollup-plugin-bundle-size for size monitoring
- **Exclusions**: Automatically excludes `*.spec.ts`, `types.ts`, and `*.ignore.*.ts` files

The build process scans `src/*.ts` files (excluding specs and types) and creates corresponding outputs in `dist/` with proper package.json exports configuration.