export const getLocalizedText = (text: any, lang: string): string => {
  if (!text) return '';
  if (typeof text === 'string') {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[lang] || parsed['en'] || Object.values(parsed)[0] || text;
      }
    } catch (e) {
      return text;
    }
    return text;
  }
  if (typeof text === 'object' && text !== null) {
    return text[lang] || text['en'] || Object.values(text)[0] || '';
  }
  return String(text);
};
