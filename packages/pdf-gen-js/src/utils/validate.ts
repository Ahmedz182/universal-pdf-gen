export function requireFields(data: Record<string, any>, fields: string[], templateName: string): void {
  const missing = fields.filter((f) => data[f] === undefined || data[f] === null || data[f] === '');
  if (missing.length > 0) {
    throw new Error(`Missing required field(s) for "${templateName}" template: ${missing.join(', ')}`);
  }
}

/** Accepts a Date instance or a date string/ISO string and returns a Date. */
export function toDate(value: Date | string | undefined, fallback: Date = new Date()): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

export function formatDate(value: Date | string | undefined): string {
  return toDate(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
