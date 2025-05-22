/**
 * Format a number as LKR currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rs. 1,234.56")
 */
export function formatCurrency(amount: number): string {
  const formatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol'
  });

  return formatter.format(amount);
}

/**
 * Parse a currency string into a number
 * @param value - The currency string to parse
 * @returns The parsed number or NaN if invalid
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol and any non-numeric characters except decimal point
  const numericString = value.replace(/[^0-9.-]/g, '');
  return parseFloat(numericString);
} 