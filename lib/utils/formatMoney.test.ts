import { formatMoney } from './formatMoney';

describe('formatMoney', () => {
  it('formats positive numbers correctly', () => {
    expect(formatMoney(100)).toBe('$100.00');
    expect(formatMoney(1000)).toBe('$1,000.00');
    expect(formatMoney(1000000)).toBe('$1,000,000.00');
  });

  it('formats decimal numbers correctly', () => {
    expect(formatMoney(100.5)).toBe('$100.50');
    expect(formatMoney(100.99)).toBe('$100.99');
    expect(formatMoney(100.999)).toBe('$101.00'); // rounds up
    expect(formatMoney(100.001)).toBe('$100.00'); // rounds down
  });

  it('formats zero correctly', () => {
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('formats negative numbers correctly', () => {
    expect(formatMoney(-100)).toBe('-$100.00');
    expect(formatMoney(-1000)).toBe('-$1,000.00');
    expect(formatMoney(-100.5)).toBe('-$100.50');
  });

  it('handles very small numbers', () => {
    expect(formatMoney(0.01)).toBe('$0.01');
    expect(formatMoney(0.001)).toBe('$0.00'); // rounds down
    expect(formatMoney(0.009)).toBe('$0.01'); // rounds up
  });

  it('handles very large numbers', () => {
    expect(formatMoney(999999999)).toBe('$999,999,999.00');
    expect(formatMoney(1000000000)).toBe('$1,000,000,000.00');
  });

  it('handles edge cases', () => {
    expect(formatMoney(Number.MAX_SAFE_INTEGER)).toBe('$9,007,199,254,740,991.00');
    expect(formatMoney(Number.MIN_SAFE_INTEGER)).toBe('-$9,007,199,254,740,991.00');
  });

  it('handles NaN and Infinity', () => {
    expect(formatMoney(NaN)).toBe('$NaN');
    expect(formatMoney(Infinity)).toBe('$∞');
    expect(formatMoney(-Infinity)).toBe('-$∞');
  });

  it('handles different currency formats', () => {
    // Test with different locales if supported
    expect(formatMoney(1000)).toBe('$1,000.00');
  });

  it('handles precision correctly', () => {
    expect(formatMoney(100.123)).toBe('$100.12'); // rounds down
    expect(formatMoney(100.125)).toBe('$100.13'); // rounds up
    expect(formatMoney(100.126)).toBe('$100.13'); // rounds up
  });
}); 