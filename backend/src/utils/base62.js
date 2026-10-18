import { customAlphabet } from 'nanoid';

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoidBase62 = customAlphabet(BASE62_CHARS, 7);

export function generateShortCode(length = 7) {
  return nanoidBase62(length);
}

export function encodeBase62(num) {
  if (num === 0) return '0';
  let s = '';
  while (num > 0) {
    s = BASE62_CHARS[num % 62] + s;
    num = Math.floor(num / 62);
  }
  return s;
}

export function decodeBase62(str) {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const idx = BASE62_CHARS.indexOf(str[i]);
    if (idx === -1) return null;
    num = num * 62 + idx;
  }
  return num;
}
