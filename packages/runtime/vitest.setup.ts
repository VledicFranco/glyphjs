// Mock ResizeObserver for jsdom (used by ContainerMeasure)
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(): void {
    /* noop — jsdom stub */
  }
  unobserve(): void {
    /* noop — jsdom stub */
  }
  disconnect(): void {
    /* noop — jsdom stub */
  }
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
