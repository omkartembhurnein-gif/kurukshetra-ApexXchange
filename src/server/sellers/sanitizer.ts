export function sanitizePayload(payload: any): { valid: boolean; sanitized: any; issues: string[] } {
  const issues: string[] = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, sanitized: null, issues: ['Payload must be a non-null object'] };
  }

  // Deep clone and clean
  const sanitized = JSON.parse(JSON.stringify(payload));

  const cleanString = (val: string) =>
    val.replace(/[<>]/g, '').trim();

  const traverse = (obj: any) => {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = cleanString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key]);
      }
    }
  };

  traverse(sanitized);

  return {
    valid: true,
    sanitized,
    issues,
  };
}
