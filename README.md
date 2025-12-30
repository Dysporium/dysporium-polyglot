# Dysporium Polyglot

**The simplest way to add multi-language support to any website. Install once, translate everywhere.**

[![npm version](https://badge.fury.io/js/dysporium-polyglot.svg)](https://www.npmjs.com/package/dysporium-polyglot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is Dysporium Polyglot?

Dysporium Polyglot is a modern internationalization library for JavaScript and TypeScript applications. It provides a complete solution for translating your application into multiple languages, handling string interpolation, pluralization, and automatic language detection.

The library is designed with flexibility in mind. Whether you're building a React application, a vanilla JavaScript site, or something entirely custom, there's a package that fits your needs.

## Packages

The library is organized into four packages:

### @dysporium/polyglot-react

React bindings for applications built with React 16.8 or later. Includes a context provider, hooks for accessing translations, and components for declarative translation rendering. Components automatically re-render when the locale changes.

**Includes:**
- TranslationProvider for wrapping your application
- useTranslation hook for accessing the translation function and locale
- useT hook for just the translation function
- useLocale hook for the current locale
- Trans component for inline translations
- withTranslation higher-order component for class components

### @dysporium/polyglot-dom

Vanilla JavaScript integration for applications without a framework. Uses data attributes to mark elements for translation. A MutationObserver automatically translates new elements added to the DOM.

**Includes:**
- DOMTranslator class for managing translations
- Automatic translation of elements with data-i18n attributes
- Support for pluralization, interpolation, and attribute translation
- Reactive updates when the locale changes

### @dysporium/polyglot-ai

AI-powered translation using large language models through the [Dysporium AI SDK](https://github.com/Dysporium/dysporium-ai-sdk). Generate translations automatically from a source language using OpenAI, Anthropic Claude, Qwen, or custom providers. Useful for rapidly localizing applications or filling in missing translations.

**Includes:**
- AILoader for generating translations on demand via AI
- AITranslator wrapper with auto-translate capabilities
- OpenAI provider for GPT models
- Anthropic provider for Claude models
- Qwen provider for Alibaba's models
- Custom provider interface for other LLMs
- Batch translation for entire locale files
- Caching to minimize API calls

### @dysporium/polyglot-core

The underlying translation engine. Install this package directly only if you're building a custom integration or working in an environment without React or DOM access. The React, DOM, and AI packages include this automatically.

**Includes:**
- Translator class for translation lookup and formatting
- Language detection from browser settings, URL, cookies, and storage
- String interpolation with configurable delimiters
- Pluralization with support for complex language rules
- JSON and remote loaders for fetching translations
- Event system for reacting to locale changes and errors

## Installation

Choose the package that matches your application:

**For React applications:**

    npm install @dysporium/polyglot-react

**For vanilla JavaScript:**

    npm install @dysporium/polyglot-dom

**For AI-powered translation:**

    npm install @dysporium/polyglot-ai

**For custom integrations:**

    npm install @dysporium/polyglot-core

## Core Concepts

### Locale

A locale identifier string such as "en", "en-US", "fr", or "zh-CN". The library uses this to determine which translations to display.

### Translation Keys

Dot-notation strings that identify translations in your translation files. Keys like "common.buttons.submit" or "errors.notFound" map to translated strings.

### Translation Files

JSON objects mapping keys to translated strings. Each locale has its own set of translations. Translations can be bundled with your application or loaded from a remote server.

### Interpolation

Variable substitution within translation strings. Placeholders like "Hello, {{name}}" are replaced with values you provide at runtime.

### Pluralization

Automatic selection of the correct plural form based on a count. Languages have different plural rules - English has two forms (singular and plural), while Arabic has six. The library handles these differences automatically.

### Fallback Chain

When a translation is missing in the current locale, the library checks fallback locales before ultimately returning the translation key. This ensures users always see meaningful content.

## Browser Support

All modern browsers are supported. Internet Explorer is not supported.

## Requirements

- Node.js 16 or later
- TypeScript 5.0 or later (for type definitions)
- React 16.8 or later (for the React package)

## Documentation

Each package includes its own README with detailed information:

- [Core Package](./packages/core/README.md)
- [DOM Package](./packages/dom/README.md)
- [AI Package](./packages/ai/README.md)
- React Package (README coming soon)

## License

MIT
