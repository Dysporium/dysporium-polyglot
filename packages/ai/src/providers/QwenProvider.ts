import type { QwenProviderConfig } from '../types';
import { DysporiumProvider, createDysporiumProvider } from './DysporiumProvider';

export class QwenProvider extends DysporiumProvider {
  constructor(config: QwenProviderConfig) {
    super('qwen', config);
  }
}

export function createQwenProvider(config: QwenProviderConfig): QwenProvider {
  return new QwenProvider(config);
}

