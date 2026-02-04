import type { InteractionEvent } from '@glyphjs/types';

/**
 * Creates a debounced interaction handler that groups events by
 * `blockId + kind`. Each unique stream is debounced independently,
 * so a tab switch fires immediately even while a table filter is
 * being debounced.
 *
 * @param callback - The handler to invoke with the debounced event.
 * @param delay - Debounce window in milliseconds (default: 300).
 * @returns A function with the same signature as `onInteraction`.
 */
export function debounceInteractions(
  callback: (event: InteractionEvent) => void,
  delay = 300,
): (event: InteractionEvent) => void {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return (event: InteractionEvent) => {
    const key = `${event.blockId}:${event.kind}`;

    const existing = timers.get(key);
    if (existing !== undefined) {
      clearTimeout(existing);
    }

    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        callback(event);
      }, delay),
    );
  };
}
