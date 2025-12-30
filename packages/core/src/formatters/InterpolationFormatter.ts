import type { Formatter } from './Formatter';
import type { TranslateOptions, InterpolationConfig } from '../types';

const DEFAULT_CONFIG: Required<InterpolationConfig> = {
  prefix: '{{',
  suffix: '}}',
  escapeHtml: false,
};

export class InterpolationFormatter implements Formatter {
  readonly name = 'interpolation';
  private config: Required<InterpolationConfig>;
  private regex: RegExp;

  constructor(config: InterpolationConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.regex = this.buildRegex();
  }

  format(value: string, options: TranslateOptions): string {
    const { values } = options;
    
    if (!values || Object.keys(values).length === 0) {
      return value;
    }

    return value.replace(this.regex, (match, key: string) => {
      const trimmedKey = key.trim();
      
      if (trimmedKey in values) {
        const replacement = String(values[trimmedKey]);
        return this.config.escapeHtml ? this.escapeHtml(replacement) : replacement;
      }
      
      return match;
    });
  }

  setConfig(config: Partial<InterpolationConfig>): void {
    this.config = { ...this.config, ...config };
    this.regex = this.buildRegex();
  }

  private buildRegex(): RegExp {
    const prefix = this.escapeRegex(this.config.prefix);
    const suffix = this.escapeRegex(this.config.suffix);
    return new RegExp(`${prefix}\\s*([\\w.]+)\\s*${suffix}`, 'g');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
  }
}

