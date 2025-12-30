import type { OpenAIProviderConfig } from '../types';
import { DysporiumProvider, createDysporiumProvider } from './DysporiumProvider';

export class OpenAIProvider extends DysporiumProvider {
  constructor(config: OpenAIProviderConfig) {
    super('openai', config);
  }
}

export function createOpenAIProvider(config: OpenAIProviderConfig): OpenAIProvider {
  return new OpenAIProvider(config);
}
