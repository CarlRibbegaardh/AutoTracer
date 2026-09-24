import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { warnIfSlow } from '../../../../../src/lib/functions/helpers/timing/warnIfSlow.js';

describe('warnIfSlow', () => {
  let consoleWarnSpy: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not warn when elapsed time is under 1000ms', () => {
    warnIfSlow(999.9, 'quickFunction');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should not warn at exactly 1000ms threshold', () => {
    warnIfSlow(1000, 'edgeCase');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should warn when elapsed time exceeds 1000ms', () => {
    warnIfSlow(1001, 'slowFunction');
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '⚠️ Task "slowFunction" took 1.00s to complete.'
    );
  });

  it('should format seconds to 2 decimal places', () => {
    warnIfSlow(5432.1, 'verySlowTask');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '⚠️ Task "verySlowTask" took 5.43s to complete.'
    );
  });

  it('should handle labels with special characters', () => {
    warnIfSlow(2500, 'App:handleClick:useCallback:anonymous');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '⚠️ Task "App:handleClick:useCallback:anonymous" took 2.50s to complete.'
    );
  });

  it('should handle empty label', () => {
    warnIfSlow(1500, '');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '⚠️ Task "" took 1.50s to complete.'
    );
  });

  it('should warn for elapsed time in seconds', () => {
    warnIfSlow(3000, 'task');
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it('should warn for multi-second elapsed time', () => {
    warnIfSlow(2000, 'task');
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it('should round milliseconds to seconds correctly', () => {
    warnIfSlow(1234.56789, 'task');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '⚠️ Task "task" took 1.23s to complete.'
    );
  });
});
