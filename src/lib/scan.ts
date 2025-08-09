// Shared QR scan parsing logic
// This utility parses the scanned text and dispatches to the appropriate handler.
// It normalizes cases, supports multiple URL patterns, and extracts usernames or share codes.

export type ScanHandlers = {
  addByCode: (code: string) => void;
  addByUsername: (username: string) => void;
  onInvalid?: (raw: string) => void;
};

export type ScanResult = 'share_code' | 'username' | 'invalid';

export function parseAndAddFromScan(rawText: string, handlers: ScanHandlers): ScanResult {
  const text = (rawText || '').trim();
  if (!text) {
    handlers.onInvalid?.(rawText);
    return 'invalid';
  }

  // 1) /contact/:shareCode pattern
  if (text.includes('/contact/')) {
    const match = text.match(/\/contact\/([a-f0-9]{8})/i);
    if (match) {
      const code = match[1].toLowerCase();
      handlers.addByCode(code);
      return 'share_code';
    }
  }

  // 2) /public/:identifier (username or share_code)
  if (text.includes('/public/')) {
    const match = text.match(/\/public\/([^\/?#\s]+)/i);
    if (match) {
      const identifier = match[1].trim();
      if (/^[a-f0-9]{8}$/i.test(identifier)) {
        handlers.addByCode(identifier.toLowerCase());
        return 'share_code';
      } else {
        handlers.addByUsername(identifier);
        return 'username';
      }
    }
  }

  // 3) Raw 8-char share code
  if (/^[a-f0-9]{8}$/i.test(text)) {
    handlers.addByCode(text.toLowerCase());
    return 'share_code';
  }

  // 4) URLs with possible identifiers
  if (text.includes('http')) {
    const urlMatch = text.match(/https?:\/\/[^\/]+\/(?:public|contact)\/([^\/?#\s]+)/i);
    if (urlMatch) {
      const identifier = urlMatch[1].trim();
      if (/^[a-f0-9]{8}$/i.test(identifier)) {
        handlers.addByCode(identifier.toLowerCase());
        return 'share_code';
      } else {
        handlers.addByUsername(identifier);
        return 'username';
      }
    }
  }

  // 5) Any 8-character hex pattern in the text
  const hexPattern = text.match(/[a-f0-9]{8}/i);
  if (hexPattern) {
    handlers.addByCode(hexPattern[0].toLowerCase());
    return 'share_code';
  }

  // 6) Unrecognized
  handlers.onInvalid?.(rawText);
  return 'invalid';
}
