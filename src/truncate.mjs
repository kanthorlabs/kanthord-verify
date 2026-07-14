export function truncate(input, maxLength, suffix = '…') {
  const text = String(input);
  const limit = Number(maxLength);

  if (!Number.isFinite(limit) || limit < 0) {
    throw new RangeError('maxLength must be a non-negative finite number');
  }

  const chars = Array.from(text);
  if (chars.length <= limit) {
    return text;
  }

  const suffixChars = Array.from(String(suffix));
  if (limit === 0) {
    return '';
  }

  if (suffixChars.length >= limit) {
    return suffixChars.slice(0, limit).join('');
  }

  return chars.slice(0, limit - suffixChars.length).join('') + suffixChars.join('');
}
