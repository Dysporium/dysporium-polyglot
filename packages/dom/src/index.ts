import type { Translator, DOMTranslatorConfig, TranslateOptions } from '@dysporium/polyglot-core';

const DEFAULT_CONFIG: Required<DOMTranslatorConfig> = {
  attribute: 'data-i18n',
  countAttribute: 'data-i18n-count',
  valuesAttribute: 'data-i18n-values',
  root: null,
  observe: true,
};

export class DOMTranslator {
  private translator: Translator;
  private config: Required<DOMTranslatorConfig>;
  private observer: MutationObserver | null = null;
  private root: Element;

  constructor(translator: Translator, config: DOMTranslatorConfig = {}) {
    this.translator = translator;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.root = this.config.root || document.body;
  }

  init(): void {
    this.translateAll();

    if (this.config.observe) {
      this.startObserving();
    }

    this.translator.on('localeChanged', () => {
      this.translateAll();
    });
  }

  translateAll(root: Element = this.root): void {
    const selector = `[${this.config.attribute}]`;
    const elements = root.querySelectorAll(selector);
    
    elements.forEach((element) => {
      this.translateElement(element as HTMLElement);
    });

    if (root.hasAttribute(this.config.attribute)) {
      this.translateElement(root as HTMLElement);
    }
  }

  translateElement(element: HTMLElement): void {
    const key = element.getAttribute(this.config.attribute);
    if (!key) return;

    const options = this.parseElementOptions(element);
    const translation = this.translator.t(key, options);

    const targetAttr = element.getAttribute(`${this.config.attribute}-attr`);
    if (targetAttr) {
      element.setAttribute(targetAttr, translation);
    } else {
      element.textContent = translation;
    }
  }

  startObserving(): void {
    if (this.observer) {
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.translateAll(node as Element);
            }
          });
        } else if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement;
          if (target.hasAttribute(this.config.attribute)) {
            this.translateElement(target);
          }
        }
      }
    });

    this.observer.observe(this.root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        this.config.attribute,
        this.config.countAttribute,
        this.config.valuesAttribute,
      ],
    });
  }

  stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  destroy(): void {
    this.stopObserving();
  }

  private parseElementOptions(element: HTMLElement): TranslateOptions {
    const options: TranslateOptions = {};

    const countAttr = element.getAttribute(this.config.countAttribute);
    if (countAttr !== null) {
      options.count = Number(countAttr);
    }

    const valuesAttr = element.getAttribute(this.config.valuesAttribute);
    if (valuesAttr) {
      try {
        options.values = JSON.parse(valuesAttr);
      } catch {
        console.warn(`[Polyglot DOM] Invalid JSON in ${this.config.valuesAttribute}:`, valuesAttr);
      }
    }

    const contextAttr = element.getAttribute(`${this.config.attribute}-context`);
    if (contextAttr) {
      options.context = contextAttr;
    }

    const defaultAttr = element.getAttribute(`${this.config.attribute}-default`);
    if (defaultAttr) {
      options.defaultValue = defaultAttr;
    }

    return options;
  }
}

export function createDOMTranslator(
  translator: Translator,
  config?: DOMTranslatorConfig
): DOMTranslator {
  const domTranslator = new DOMTranslator(translator, config);
  domTranslator.init();
  return domTranslator;
}

export function translateDOM(
  translator: Translator,
  config?: DOMTranslatorConfig
): () => void {
  const domTranslator = createDOMTranslator(translator, config);
  return () => domTranslator.destroy();
}

export type { DOMTranslatorConfig };
