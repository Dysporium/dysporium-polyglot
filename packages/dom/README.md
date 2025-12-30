# @dysporium/polyglot-dom

Declarative DOM translation for vanilla JavaScript applications. This package automatically translates HTML elements using data attributes, with no framework required.

## Overview

The DOM package bridges the Dysporium Polyglot core engine with the browser DOM. It scans your HTML for specially-marked elements and applies translations based on the current locale. When the locale changes, all translated elements update automatically.

This package is designed for projects that do not use React or other UI frameworks. For React applications, use `@dysporium/polyglot-react` instead.

## Features

### Attribute-Based Translation

Elements are marked for translation using data attributes. The primary attribute holds the translation key, while optional attributes provide pluralization counts, interpolation values, and context.

Default attributes:

- `data-i18n` - The translation key to look up
- `data-i18n-count` - A number for plural form selection
- `data-i18n-values` - JSON object containing interpolation variables
- `data-i18n-context` - Contextual hint for translation disambiguation
- `data-i18n-default` - Fallback text when translation is missing
- `data-i18n-attr` - Target attribute name instead of text content

### Automatic DOM Observation

A MutationObserver watches for changes to the DOM tree. When new elements with translation attributes are added, they are translated immediately without manual intervention. This works seamlessly with dynamically generated content and single-page application navigation.

### Reactive Locale Changes

The translator subscribes to locale change events from the core engine. When a user switches languages, every translated element on the page updates to reflect the new locale.

### Attribute Translation

Beyond text content, translations can target element attributes. This is useful for translating placeholder text in inputs, title attributes for tooltips, aria-label values for accessibility, and other attribute-based content.

### Scoped Translation

Translations can be scoped to a specific root element rather than the entire document body. This allows multiple independent translation contexts on a single page or limits the observation scope for performance optimization.

## Installation

**npm**

    npm install @dysporium/polyglot-dom

**pnpm**

    pnpm add @dysporium/polyglot-dom

**yarn**

    yarn add @dysporium/polyglot-dom

## Package Exports

- `DOMTranslator` - Main class for DOM translation management
- `createDOMTranslator` - Factory function that creates and initializes a translator
- `translateDOM` - Convenience function that returns a cleanup callback
- `DOMTranslatorConfig` - TypeScript interface for configuration options

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| attribute | string | `data-i18n` | Primary attribute for translation keys |
| countAttribute | string | `data-i18n-count` | Attribute for plural count values |
| valuesAttribute | string | `data-i18n-values` | Attribute for interpolation variables |
| root | Element | document.body | Root element to observe and translate |
| observe | boolean | true | Whether to watch for DOM mutations |

## Dependencies

This package includes `@dysporium/polyglot-core` as a dependency. The core package provides the translation engine, locale management, and formatting capabilities. You do not need to install it separately.

## Related Packages

- `@dysporium/polyglot-core` - Core translation engine
- `@dysporium/polyglot-react` - React hooks and components

## Browser Support

Requires browsers with MutationObserver support. All modern browsers are supported. Internet Explorer is not supported.

## License

MIT

