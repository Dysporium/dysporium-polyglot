export type EventCallback<T = unknown> = (payload: T) => void;

export class EventEmitter<Events extends Record<string, unknown>> {
  private listeners: Map<keyof Events, Set<EventCallback<unknown>>> = new Map();

  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);
    return () => this.off(event, callback);
  }

  once<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): () => void {
    const wrapper: EventCallback<Events[K]> = (payload) => {
      this.off(event, wrapper);
      callback(payload);
    };
    return this.on(event, wrapper);
  }

  off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback<unknown>);
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event listener for "${String(event)}":`, error);
        }
      });
    }
  }

  removeAllListeners(event?: keyof Events): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
