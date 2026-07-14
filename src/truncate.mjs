export function truncate(input, maxLength, ellipsis = '…') {
  const text = String(input);
  const limit = Number(maxLength);

  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError('maxLength must be a non-negative integer');
  }

  const chars = Array.from(text);
  if (chars.length <= limit) {
    return text;
  }

  if (limit === 0) {
    return '';
  }

  const ellipsisChars = Array.from(String(ellipsis));
  const available = Math.max(0, limit - ellipsisChars.length);
  return chars.slice(0, available).join('') + ellipsisChars.join('');
}
