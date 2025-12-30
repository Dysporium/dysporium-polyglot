import type { TranslateOptions } from '../types';

export interface Formatter {
  readonly name: string;
  format(value: string, options: TranslateOptions): string;
}

export function createFormatterPipeline(formatters: Formatter[]): Formatter {
  return {
    name: 'pipeline',
    format(value: string, options: TranslateOptions): string {
      return formatters.reduce(
        (result, formatter) => formatter.format(result, options),
        value
      );
    },
  };
}
