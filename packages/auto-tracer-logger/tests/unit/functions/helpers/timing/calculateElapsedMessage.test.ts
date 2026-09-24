import { describe, it, expect } from 'vitest';
import { calculateElapsedMessage } from '../../../../../src/lib/functions/helpers/timing/calculateElapsedMessage.js';

describe('calculateElapsedMessage', () => {
  it('should format message with elapsed time in milliseconds', () => {
    const result = calculateElapsedMessage('myFunction', 42.5);
    expect(result).toBe('myFunction (elapsed: 42.50ms)');
  });

  it('should format message with integer elapsed time', () => {
    const result = calculateElapsedMessage('testFunc', 100);
    expect(result).toBe('testFunc (elapsed: 100.00ms)');
  });

  it('should format message with small elapsed time', () => {
    const result = calculateElapsedMessage('quickOp', 0.3);
    expect(result).toBe('quickOp (elapsed: 0.30ms)');
  });

  it('should handle zero elapsed time', () => {
    const result = calculateElapsedMessage('instant', 0);
    expect(result).toBe('instant (elapsed: 0.00ms)');
  });

  it('should handle large elapsed time', () => {
    const result = calculateElapsedMessage('slowTask', 5432.1);
    expect(result).toBe('slowTask (elapsed: 5432.10ms)');
  });

  it('should handle labels with special characters', () => {
    const result = calculateElapsedMessage('App:handleClick', 15.7);
    expect(result).toBe('App:handleClick (elapsed: 15.70ms)');
  });

  it('should handle empty label', () => {
    const result = calculateElapsedMessage('', 10);
    expect(result).toBe(' (elapsed: 10.00ms)');
  });

  it('should round to 2 decimal places', () => {
    const result = calculateElapsedMessage('func', 1.23456789);
    expect(result).toBe('func (elapsed: 1.23ms)');
  });
});
