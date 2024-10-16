type EventHandler<T> = (data: T) => void;

export class PubSub {
  private events: Map<string, EventHandler<any>[]>

  constructor () {
    this.events = new Map()
  }

  subscribe<T> (eventName: string, handler: EventHandler<T>): void {
    if (typeof handler !== 'function') {
      throw new Error(`Handler for event '${eventName}' must be a function.`)
    }

    const handlers = this.events.get(eventName) || []
    handlers.push(handler)
    this.events.set(eventName, handlers)
  }

  unsubscribe<T> (eventName: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(eventName)
    if (!handlers) {
      return
    }
    // Remove specific handler function
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
    // If there is no handler function, delete the entire event record
    if (handlers.length === 0) {
      this.events.delete(eventName)
    }
  }

  publish<T> (eventName: string, data?: T): void {
    const handlers = this.events.get(eventName)
    if (!handlers) {
      return
    }
    // Call all handler functions
    handlers.forEach((handler) => handler(data))
  }
}
