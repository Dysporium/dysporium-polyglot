# @dysporium/polyglot-core

The foundational translation engine that powers Dysporium Polyglot. This package provides framework-agnostic internationalization primitives for JavaScript and TypeScript applications.

## Overview

This is the core package of the Dysporium Polyglot ecosystem. It handles all translation logic, locale management, and text formatting without any framework dependencies. Use this package directly when building custom integrations or when working outside of React or DOM environments.

## Features

### Translation Engine

The `Translator` class serves as the central hub for all translation operations. It manages the current locale, resolves translation keys against your translation files, and handles fallback logic when translations are missing.

### Automatic Language Detection

The `LanguageDetector` identifies the user's preferred language through multiple sources including browser settings, URL parameters, cookies, and localStorage. Detection sources are configurable and can be prioritized to match your application's needs.

### String Interpolation

Variable substitution within translation strings uses a configurable delimiter syntax. The default double curly brace format can be customized to match existing translation files or team preferences.

### Pluralization

Built-in plural form resolution supports the grammatical rules of different languages. The system handles languages with simple singular/plural distinctions as well as those with more complex plural categories.

### Translation Loaders

Modular loaders fetch translations from various sources:

- **JSONLoader** reads translation files from the local filesystem or bundled assets
- **RemoteLoader** fetches translations from HTTP endpoints
- **CompositeLoader** combines multiple loaders with priority ordering
- **CachedLoader** wraps any loader with caching to reduce redundant requests

### Event System

An event emitter provides hooks into the translation lifecycle. Subscribe to locale changes, translation loading completion, missing translation warnings, and error conditions.

### Fallback Chain

When a translation is missing in the current locale, the engine walks through configured fallback locales before ultimately falling back to the default locale. This ensures users always see meaningful content.

## Installation

Install via your preferred package manager:

**npm**

    npm install @dysporium/polyglot-core

**pnpm**

    pnpm add @dysporium/polyglot-core

**yarn**

    yarn add @dysporium/polyglot-core

## Package Exports

The package provides the following primary exports:

- `Translator` - Main translation class
- `TranslationStore` - Storage and retrieval of translation data
- `LanguageDetector` - Browser language detection utilities
- `InterpolationFormatter` - Variable substitution in strings
- `PluralFormatter` - Plural form selection
- `BaseLoader`, `JSONLoader`, `RemoteLoader`, `CompositeLoader`, `CachedLoader` - Translation loading strategies
- `EventEmitter` - Subscription-based event handling
- Full TypeScript type definitions for all interfaces and options

## Related Packages

- `@dysporium/polyglot-react` - React bindings with hooks and components (includes core)
- `@dysporium/polyglot-dom` - Vanilla JS DOM integration with automatic element translation (includes core)
- `@dysporium/polyglot-ai` - AI-powered translation using OpenAI, Claude, or custom providers (includes core)

Most users should install one of the above packages rather than core directly. Install core only when building custom integrations or working in environments without React or DOM access.

## Requirements

- Node.js 16 or later
- TypeScript 5.0 or later (for type definitions)

## License

MIT

