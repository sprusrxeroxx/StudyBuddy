import { EventEmitter } from 'events';

/**
 * Singleton EventBus for loose coupling between components
 * Implements Observer pattern using Node.js EventEmitter
 */
class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    // Set max listeners to prevent memory leak warnings
    this.setMaxListeners(50);
  }

  /**
   * Get singleton instance of EventBus
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Emit event with type safety
   */
  public emitEvent<T = any>(event: string, data?: T): boolean {
    console.log(`[EventBus] Emitting event: ${event}`, data);
    return this.emit(event, data);
  }

  /**
   * Subscribe to event with type safety
   */
  public subscribe<T = any>(event: string, listener: (data?: T) => void): this {
    console.log(`[EventBus] Subscribing to event: ${event}`);
    return this.on(event, listener);
  }

  /**
   * Unsubscribe from event
   */
  public unsubscribe(event: string, listener: (...args: any[]) => void): this {
    console.log(`[EventBus] Unsubscribing from event: ${event}`);
    return this.off(event, listener);
  }

  /**
   * Subscribe to event once only
   */
  public subscribeOnce<T = any>(event: string, listener: (data?: T) => void): this {
    console.log(`[EventBus] Subscribing once to event: ${event}`);
    return this.once(event, listener);
  }
}

// Export singleton instance
export default EventBus.getInstance();
