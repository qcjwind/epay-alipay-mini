// Non type tools

// Compare version
export function compareVersion(v1, v2) {
  const s1 = v1.split('.');
  const s2 = v2.split('.');
  const len = Math.max(s1.length, s2.length);

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(s1[i] || '0');
    const num2 = parseInt(s2[i] || '0');

    if (num1 > num2) {
      return true;
    } else if (num1 < num2) {
      return false;
    }
  }

  return true;
}