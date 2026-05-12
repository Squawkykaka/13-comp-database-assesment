declare global {
  interface EventMap {
    "lobby.user": { user: string };
  }
}

type DomainEvent = {
  [K in keyof EventMap]: {
    kind: K;
    date: Date;
  } & EventMap[K];
}[keyof EventMap];

export type EventKind = DomainEvent["kind"];
export type EventOf<K extends EventKind> = Omit<
  Extract<DomainEvent, { kind: K }>,
  "kind"
>;
type Handler<K extends EventKind> = (e: EventOf<K>) => void | Promise<void>;

class EventBus {
  private handlers: {
    [K in EventKind]?: Set<Handler<K>>;
  } = {};

  publish<K extends EventKind>(kind: K, event: EventOf<K>): void {
    const set = this.handlers[kind];
    if (!set) return;

    for (const h of set) {
      try {
        void h(event);
      } catch (error) {
        console.error(`[bus] ${kind} handler threw`, error);
      }
    }
  }

  subscribe<K extends EventKind>(kind: K, handler: Handler<K>) {
    const set = this.handlers[kind];
    set.add(handler);
    return () => set.delete(handler);
  }
}

let bus = new EventBus();

bus.subscribe("lobby.settings", (event) => console.log(event));
bus.publish("lobby.user", { date: new Date(), user: "Bob" });
