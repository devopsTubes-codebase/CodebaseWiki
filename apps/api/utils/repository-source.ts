export function normalizeProjectSourceKey(sourceType: 'zip' | 'github', sourceInput: string): string | null {
  const trimmed = sourceInput.trim();

  if (sourceType !== 'github') {
    return null;
  }

  return trimmed.toLowerCase().replace(/\.git\/?$/, '').replace(/\/+$/, '');
}
