import { useState, useCallback, useRef } from 'react';
import type { InteractionEvent } from '@glyphjs/types';

const MAX_EVENTS = 50;

export interface InteractionLogEntry {
  id: number;
  event: InteractionEvent;
}

export interface InteractionLog {
  events: InteractionLogEntry[];
  addEvent: (event: InteractionEvent) => void;
  clearEvents: () => void;
}

export function useInteractionLog(): InteractionLog {
  const [events, setEvents] = useState<InteractionLogEntry[]>([]);
  const nextId = useRef(0);

  const addEvent = useCallback((event: InteractionEvent) => {
    const id = nextId.current++;
    setEvents((prev) => [{ id, event }, ...prev].slice(0, MAX_EVENTS));
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, addEvent, clearEvents };
}
