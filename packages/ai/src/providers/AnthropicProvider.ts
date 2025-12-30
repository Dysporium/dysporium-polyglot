import type { AnthropicProviderConfig } from '../types';
import { DysporiumProvider, createDysporiumProvider } from './DysporiumProvider';

export class AnthropicProvider extends DysporiumProvider {
  constructor(config: AnthropicProviderConfig) {
    super('anthropic', config);
  }
}

export function createAnthropicProvider(config: AnthropicProviderConfig): AnthropicProvider {
  return new AnthropicProvider(config);
}
