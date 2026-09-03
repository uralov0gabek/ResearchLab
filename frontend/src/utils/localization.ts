/**
 * Extracts a localized string from a value that may be:
 * - A plain string
 * - A JSON-stringified {en, ru, uz} object (stored by useSurvey's toStableString)
 * - A raw {en, ru, uz} object
 * Always returns a plain string — never an object (prevents React Error #31).
 */
export const getLocalizedText = (text: any, lang: string): string => {
  if (text === null || text === undefined) return '';

  // Plain string — try to parse as JSON in case it's a stringified localization object
  if (typeof text === 'string') {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const val = parsed[lang] || parsed['en'] || parsed['uz'] || parsed['ru'];
        if (val && typeof val === 'string') return val;
        // Fallback: first string value in the object
        const first = Object.values(parsed).find(v => typeof v === 'string');
        return (first as string) || text;
      }
    } catch {
      // Not JSON, return as-is
    }
    return text;
  }

  // Raw object {en, ru, uz}
  if (typeof text === 'object' && !Array.isArray(text)) {
    const val = text[lang] || text['en'] || text['uz'] || text['ru'];
    if (val && typeof val === 'string') return val;
    const first = Object.values(text).find(v => typeof v === 'string');
    return (first as string) || '';
  }

  // Number, boolean, etc.
  return String(text);
};
