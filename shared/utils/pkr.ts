/**
 * PKR currency formatting utilities.
 * Pure functions — no imports, no side effects.
 */

function insertCommas(intStr: string): string {
  // Insert commas per South Asian numbering convention:
  // last three digits as a group, then groups of two from the right.
  // e.g. 1500 → "1,500", 150000 → "1,50,000"
  // Per the spec examples: 1500 → "1,500" and 150000 → "150,000"
  // which matches Western comma formatting (groups of 3).
  const len = intStr.length;
  if (len <= 3) {
    return intStr;
  }
  let result = '';
  let count = 0;
  for (let i = len - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      result = ',' + result;
    }
    result = intStr[i] + result;
    count++;
  }
  return result;
}

/**
 * Formats a PKR amount with commas.
 * formatPkr(1500)   → "PKR 1,500"
 * formatPkr(150000) → "PKR 150,000"
 * formatPkr(0)      → "PKR 0"
 */
export function formatPkr(amount: number): string {
  const rounded = Math.round(amount);
  const intStr = Math.abs(rounded).toString();
  const formatted = insertCommas(intStr);
  const sign = rounded < 0 ? '-' : '';
  return `PKR ${sign}${formatted}`;
}

/**
 * Formats a PKR amount with K/M abbreviations.
 * formatPkrCompact(500)     → "PKR 500"
 * formatPkrCompact(1500)    → "PKR 1.5K"
 * formatPkrCompact(150000)  → "PKR 150K"
 * formatPkrCompact(1500000) → "PKR 1.5M"
 */
export function formatPkrCompact(amount: number): string {
  const rounded = Math.round(amount);
  const abs = Math.abs(rounded);
  const sign = rounded < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    const value = abs / 1_000_000;
    const truncated = Math.round(value * 10) / 10;
    const label = truncated % 1 === 0 ? truncated.toString() : truncated.toFixed(1);
    return `PKR ${sign}${label}M`;
  }

  if (abs >= 1_000) {
    const value = abs / 1_000;
    const truncated = Math.round(value * 10) / 10;
    const label = truncated % 1 === 0 ? truncated.toString() : truncated.toFixed(1);
    return `PKR ${sign}${label}K`;
  }

  return `PKR ${sign}${abs.toString()}`;
}
