type DomainEvent = {
  [K in keyof EventMap]: {
    kind: K;
    date: Date;
  } & EventMap[K];
}[keyof EventMap];

export type EventKind = DomainEvent["kind"];
export type EventOf<K extends EventKind> = Extract<DomainEvent, { kind: K; }>;
type Handler<K extends EventKind> = (e: EventOf<K>) => void | Promise<void>;

class EventBus {
  private handlers: {
    [K in EventKind]?: Set<Handler<K>>;
  } = {};
  private allHandlers = new Set<
    (e: DomainEvent) => void | Promise<void>
  >();

  publish<K extends EventKind>(kind: K, event: Omit<EventOf<K>, "kind" | "date">): void {
    let computedEvent = {
      ...event,
      date: new Date(),
      kind
    } as EventOf<K>;

    for (const h of this.allHandlers) {
      try {
        void h(computedEvent);
      } catch (error) {
        console.error(`[bus (All Events)]: handler threw`, error);
      }
    }

    const set = this.handlers[kind];
    if (!set) return;

    for (const h of set) {
      try {
        void h(computedEvent);
      } catch (error) {
        console.error(`[bus] ${kind} handler threw`, error);
      }
    }
  }

  subscribe<K extends EventKind>(kind: K, handler: Handler<K>) {
    const set =
      (this.handlers[kind] as Set<Handler<K>>) ??= new Set();

    set.add(handler);
    return () => set.delete(handler);
  }


  subscribeAll(
    handler: (e: DomainEvent) => void | Promise<void>,
  ) {
    this.allHandlers.add(handler);
    return () => this.allHandlers.delete(handler);
  }
}

const globalForBus = globalThis as typeof globalThis & {
  __EVENT_BUS__?: EventBus;
};

export const EVENT_BUS =
  globalForBus.__EVENT_BUS__ ??= new EventBus();

