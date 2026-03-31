/**
 * PII Scrubber — strips personally identifiable information from messages
 * before they leave the Autarch server boundary to external AI providers.
 *
 * This is a DSGVO-compliance requirement (DIRECTIVE-002).
 * Patterns: Email, Phone (DE/international), IBAN, German tax IDs.
 */

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,6}/g;
const IBAN_RE = /\b[A-Z]{2}\d{2}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{0,2}\b/g;
const TAX_ID_RE = /\b\d{2,3}\/?\d{3}\/?\d{4,5}\b/g;

interface ScrubResult {
  text: string;
  scrubCount: number;
}

export function scrubPii(text: string): ScrubResult {
  let scrubCount = 0;

  const scrubbed = text
    .replace(EMAIL_RE, () => {
      scrubCount++;
      return "[EMAIL_REDACTED]";
    })
    .replace(IBAN_RE, () => {
      scrubCount++;
      return "[IBAN_REDACTED]";
    })
    .replace(PHONE_RE, () => {
      scrubCount++;
      return "[PHONE_REDACTED]";
    })
    .replace(TAX_ID_RE, () => {
      scrubCount++;
      return "[TAX_ID_REDACTED]";
    });

  return { text: scrubbed, scrubCount };
}

export function scrubContextMessages(
  messages: Array<{ role: string; content: string }>,
): { messages: Array<{ role: string; content: string }>; totalScrubbed: number } {
  let totalScrubbed = 0;

  const scrubbedMessages = messages.map((msg) => {
    const { text, scrubCount } = scrubPii(msg.content ?? "");
    totalScrubbed += scrubCount;
    return { ...msg, content: text };
  });

  return { messages: scrubbedMessages, totalScrubbed };
}
