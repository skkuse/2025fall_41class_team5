// Utility to parse template strings like {"논문명 1": "논문링크 1", "논문명 2": "논문링크 2"}
export function parseTemplateLinks(text: string): { text: string; links: Array<{ name: string; url: string }> } {
  const linkPattern = /\{[^}]*\}/g;
  const matches = text.match(linkPattern);
  
  if (!matches) {
    return { text, links: [] };
  }

  const links: Array<{ name: string; url: string }> = [];
  let cleanText = text;

  matches.forEach(match => {
    try {
      // Remove curly braces and parse as JSON-like object
      const jsonStr = match.replace(/&quot;/g, '"');
      const parsed = JSON.parse(jsonStr);
      
      Object.entries(parsed).forEach(([name, url]) => {
        if (typeof name === 'string' && typeof url === 'string') {
          links.push({ name, url });
        }
      });
      
      // Remove the template from text
      cleanText = cleanText.replace(match, '').trim();
    } catch (e) {
      // If parsing fails, keep the original text
      console.warn('Failed to parse template:', match);
    }
  });

  return { text: cleanText, links };
}