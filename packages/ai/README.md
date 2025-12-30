# @dysporium/polyglot-ai

AI-powered translation for Dysporium Polyglot. Generate translations automatically using large language models through the [Dysporium AI SDK](https://github.com/Dysporium/dysporium-ai-sdk).

## Overview

This package extends Dysporium Polyglot with the ability to generate translations using AI. Instead of manually translating every string in your application, you can provide translations in a source language and let an LLM generate translations for other locales on demand.

The package uses the Dysporium AI SDK under the hood, providing a unified interface across multiple AI providers with type safety, streaming support, and production-ready features like retry logic and error handling.

## Features

### Multiple Provider Support

Built-in support through Dysporium AI SDK providers:

- **OpenAI** - GPT-4, GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo
- **Anthropic** - Claude 3 Opus, Sonnet, Haiku, and Claude 3.5 Sonnet
- **Qwen** - Alibaba's Qwen models
- **Custom** - Bring your own provider with a simple interface

### AI Loader

The AILoader implements the standard Dysporium loader interface. When translations for a locale are requested, the loader translates your source translations using the configured AI provider. Results are cached to avoid redundant API calls.

### AI Translator Wrapper

The AITranslator wraps your existing Translator instance with AI capabilities. It can automatically translate missing keys on demand, generate entire locale files, or translate specific keys programmatically.

### Automatic Translation

Enable auto-translate mode to automatically generate translations for missing keys. When a translation is not found in the current locale, the AI translator fetches the source text and requests a translation from the AI provider.

### Batch Translation

Translate multiple keys or entire translation files in a single API call. The batch translation feature optimizes token usage by combining multiple strings into a single request.

### Context-Aware Translation

Provide context to help the AI generate more accurate translations. Context might include information about your application domain, tone preferences, or terminology guidelines.

### Placeholder Preservation

The AI providers are instructed to preserve interpolation placeholders exactly as they appear in the source text. Placeholders like `{{name}}` or `{count}` remain intact in translated output.

## Installation

**npm**

    npm install @dysporium/polyglot-ai

**pnpm**

    pnpm add @dysporium/polyglot-ai

**yarn**

    yarn add @dysporium/polyglot-ai

Then install your preferred AI provider:

**For OpenAI:**

    npm install @dysporium-sdk/openai

**For Anthropic:**

    npm install @dysporium-sdk/anthropic

**For Qwen:**

    npm install @dysporium-sdk/qwen


## Provider Configuration

All providers accept a model instance from the Dysporium AI SDK along with optional parameters:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| model | SDK model | required | Model instance from Dysporium SDK provider |
| maxTokens | number | 4096 | Maximum tokens in response |
| temperature | number | 0.3 | Sampling temperature |

## AI Loader Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| provider | AIProvider | required | The AI provider to use |
| sourceLocale | string | required | Locale of your source translations |
| sourceTranslations | object | required | Your base translation file |
| context | string | undefined | Context to improve translation quality |
| cacheResults | boolean | true | Whether to cache generated translations |

## AI Translator Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| provider | AIProvider | required | The AI provider to use |
| sourceLocale | string | required | Locale of your source translations |
| autoTranslate | boolean | false | Auto-translate missing keys |
| cacheResults | boolean | true | Whether to cache translations |
| context | string | undefined | Context for translations |

## Dependencies

This package includes `@dysporium/polyglot-core` and `@dysporium-sdk/core` as dependencies. Provider packages (`@dysporium-sdk/openai`, `@dysporium-sdk/anthropic`, `@dysporium-sdk/qwen`) are optional peer dependencies - install only the ones you need.

## Related Packages

- `@dysporium/polyglot-core` - Core translation engine
- `@dysporium/polyglot-react` - React hooks and components
- `@dysporium/polyglot-dom` - Vanilla JS DOM integration
- [Dysporium AI SDK](https://dysporium.mintlify.app/getting-started) - Unified AI provider interface

## Cost Considerations

AI-powered translation incurs costs based on your provider's pricing. Consider these strategies to manage costs:

- Cache translations aggressively to avoid repeated API calls
- Generate locale files once and commit them to your repository
- Use smaller models for development and larger models for production
- Batch translate during build time rather than at runtime

## License

MIT
