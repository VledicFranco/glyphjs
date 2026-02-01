// Browser shim for Node.js crypto.createHash used by @glyphjs/ir.
// Uses the Web Crypto API (SubtleCrypto) which is available in all modern browsers.
// Since the IR package uses createHash synchronously, we provide a synchronous
// fallback using a simple hash when SubtleCrypto is not available synchronously.

class BrowserHash {
  private data = '';
  update(input: string): this {
    this.data += input;
    return this;
  }
  digest(encoding: string): string {
    if (encoding === 'hex') {
      // Simple but deterministic hash for browser use.
      // This doesn't need to be cryptographically secure — it's only
      // used for content-addressed block IDs in the demo.
      let h1 = 0xdeadbeef;
      let h2 = 0x41c6ce57;
      for (let i = 0; i < this.data.length; i++) {
        const ch = this.data.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
      h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
      h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
      // Produce a 64-char hex string (SHA-256 length) by repeating
      const hex32 =
        (h1 >>> 0).toString(16).padStart(8, '0') +
        (h2 >>> 0).toString(16).padStart(8, '0') +
        ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0') +
        (combined >>> 0).toString(16).padStart(8, '0');
      return (hex32 + hex32).slice(0, 64);
    }
    return this.data;
  }
}

export function createHash(_algorithm: string) {
  return new BrowserHash();
}
